import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { createHash } from "crypto";
import * as _ from "lodash";
import { In, LessThan, MoreThan, Repository } from "typeorm";
import { UserSessionDto } from "./dto/UserSessionDto";
import { UserSessionRefreshPutPostDto } from "./dto/UserSessionRefreshPutPost.dto";
import { UserSessionRefreshEntity } from "./entity/UserSessionRefresh.entity";
import {JwtService} from "@nestjs/jwt";
import {TokenBlacklistEntity} from "./entity/tokenBlacklist.entity";

@Injectable()
export class UserSessionRefreshService {
    private readonly logger = new Logger(UserSessionRefreshService.name);

    constructor(
        @InjectRepository(UserSessionRefreshEntity)
        private readonly userSessionRefreshRepo: Repository<UserSessionRefreshEntity>,
        @InjectRepository(TokenBlacklistEntity)
        private readonly tokenBlacklistRepo: Repository<TokenBlacklistEntity>,
        private readonly jwtService: JwtService,
    ) {}

    public async getSessionBySessionId(sessionId: string): Promise<UserSessionDto> {
        const session = await this.userSessionRefreshRepo.findOne({ where: [{ sessionId: sessionId }] });
        return this.toUserSessionRefreshDto(session);
    }

    public async getActiveSessionsByUserId(userId: string): Promise<UserSessionDto[]> {
        const sessions = await this.userSessionRefreshRepo.find({
            where: [
                {
                    userId: userId,
                    expiresAt: MoreThan(new Date().getTime().toString()),
                },
            ],
        });
        return this.toUserSessionRefreshDto(sessions);
    }

    public async getSessionBySessionIdAsEntity(sessionId: string): Promise<UserSessionRefreshEntity> {
        return await this.userSessionRefreshRepo.findOne({ where: { sessionId: sessionId } });
    }

    /**
     * FOR INTERNAL USE ONLY! NOT FOR CONTROLLER USE!
     */
    public async getSessionsByUserId(userId: string): Promise<UserSessionRefreshEntity[]> {
        return await this.userSessionRefreshRepo.find({ where: [{ userId: userId }] });
    }

    /**
     * FOR INTERNAL USE ONLY! NOT FOR CONTROLLER USE!
     */
    public async getSessions(): Promise<UserSessionRefreshEntity[]> {
        return await this.userSessionRefreshRepo.find();
    }

    /**
     * FOR INTERNAL USE ONLY! NOT FOR CONTROLLER USE!
     */
    public async getSessionByRefreshTokenAndUserId(refreshToken: string, userId: string): Promise<UserSessionRefreshEntity> {
        const sessions = await this.getSessionsByUserId(userId);
        const sha = createHash("sha256").update(refreshToken).digest("base64");
        const find = await this.asyncFind(sessions, async (s) => {
            return await bcrypt.compare(sha, s.refreshTokenHash);
        });
        return find as Promise<UserSessionRefreshEntity>;
    }

    /**
     * FOR INTERNAL USE ONLY! NOT FOR CONTROLLER USE!
     */
    public async getSessionByRefreshToken(refreshToken: string): Promise<UserSessionRefreshEntity> {
        const sessions = await this.getSessions();
        const sha = this.generateHashFromRefreshToken(refreshToken);
        const find = await this.asyncFind(sessions, async (s) => {
            return await bcrypt.compare(sha, s.refreshTokenHash);
        });
        return find as Promise<UserSessionRefreshEntity>;
    }

    public generateHashFromRefreshToken(refreshToken: string) {
        return createHash("sha256").update(refreshToken).digest("base64");
    }

    /**
     * FOR INTERNAL USE ONLY! NOT FOR CONTROLLER USE!
     */
    public async getExpiredSessions(): Promise<UserSessionRefreshEntity[]> {
        const currentDateWithDebugSafety = (new Date().getTime() + 86400000).toString(); // debug safety + 24h
        return await this.userSessionRefreshRepo.find({ where: [{ expiresAt: LessThan(currentDateWithDebugSafety) }] });
    }

    public async postSession(newData: UserSessionRefreshPutPostDto): Promise<UserSessionDto> {
        const count = await this.getActiveSessionsCountByUserId(newData.userId);
        if (count > 5) {
            const diff = count - 6; // 5 as session limit + 1 as place for new session
            let sessions = await this.getActiveSessionsByUserId(newData.userId);
            sessions = _.orderBy(sessions, "expiresAt", "asc");
            const deleteSessionIds = sessions.splice(0, diff).map((s) => s.sessionId);
            for (const s of deleteSessionIds) {
                await this.deleteSessionBySessionId(s);
            }
        }
        const creation = await this.createEntity(newData);
        const save = await this.userSessionRefreshRepo.save(creation);
        return this.toUserSessionRefreshDto(save);
    }

    private async createEntity(newData: UserSessionRefreshPutPostDto) {
        const salt = await bcrypt.genSalt(11);
        const sha = createHash("sha256").update(newData.refreshToken).digest("base64");
        const hash = await bcrypt.hash(sha, salt);
        return this.userSessionRefreshRepo.create({
            ...newData,
            refreshTokenHash: hash,
        });
    }

    public async addTokenToBlacklist(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_TOKEN_SECRET });
            if (payload && !_.isEmpty(payload.userId)) {
                await this.tokenBlacklistRepo.save({
                    userId: payload.userId,
                    refreshToken: refreshToken,
                    expiresAt: payload.exp
                })
            }
        }
        catch (e) {
            throw new HttpException(`Refresh Token ${refreshToken} cannot be added to blacklist because the token is not valid.`, HttpStatus.BAD_REQUEST);
        }
    }

    public async checkTokenBlacklistByToken(refreshToken: string): Promise<TokenBlacklistEntity | null> {
        const find = await this.tokenBlacklistRepo.findOne({ where: { refreshToken: refreshToken }});
        if (find) {
            return find;
        }
        return null;

    }

    public async deleteExpiredBlacklistTokens(): Promise<number> {
        const find = await this.tokenBlacklistRepo.findBy({ expiresAt: MoreThan(new Date().getTime())});
        if (find) {
            for (const e of find) {
                await this.tokenBlacklistRepo.delete({  refreshToken: e.refreshToken} );
            }
            this.logger.log(`Token Blacklist: Cleaned up ${find.length} expired refresh tokens on token blacklist.`)
        }
        return 0;
    }

    public async putSession(sessionId: string, newData: UserSessionRefreshPutPostDto): Promise<UserSessionDto> {
        const find = await this.getSessionBySessionId(sessionId);
        if (!find) {
            throw new HttpException("session not found", HttpStatus.BAD_REQUEST);
        }
        await this.userSessionRefreshRepo.update({ sessionId: sessionId }, await this.createEntity(newData));
        return await this.getSessionBySessionId(sessionId);
    }

    public async deleteSessionBySessionId(sessionId: string) {
        return await this.userSessionRefreshRepo.delete(sessionId);
    }

    public async deleteSessionByRefreshTokenIfExists(refreshToken: string) {
        const find = await this.getSessionByRefreshToken(refreshToken);
        if (find) {
            await this.addTokenToBlacklist(refreshToken);
            return await this.deleteSessionBySessionId(find.sessionId);
        }
    }

    /**
     * Deletes entity entries which are older then the current date + 24h for debug and logging safety. Method returns deleted sessions.
     */
    public async deleteExpiredSessions(): Promise<number> {
        const find = await this.getExpiredSessions();
        if (!_.isEmpty(find)) {
            for (const s of find) {
                await this.deleteSessionBySessionId(s.sessionId);
            }
        }
        return find.length;
    }

    async deleteSessionsForUserId(userId: string, excludeId?: string) {
        const sessions = (await this.getSessionsByUserId(userId)).map((s) => s.sessionId);
        if (excludeId && !!excludeId) {
            const index = sessions.findIndex((s) => s === excludeId);
            if (index >= 0) {
                sessions.splice(index, 1);
            }
        }
        return await this.userSessionRefreshRepo.delete({ sessionId: In(sessions) });
    }

    async getActiveSessionsCountByUserId(userId: string) {
        return await this.userSessionRefreshRepo.count({
            where: [
                {
                    userId: userId,
                    expiresAt: MoreThan(new Date().getTime().toString()),
                },
            ],
        });
    }

    private toUserSessionRefreshDto(session: UserSessionDto): UserSessionDto;
    private toUserSessionRefreshDto(sessions: UserSessionDto[]): UserSessionDto[];
    private toUserSessionRefreshDto(sessionData: UserSessionDto | UserSessionDto[]): UserSessionDto | UserSessionDto[] {
        if (sessionData && Array.isArray(sessionData)) {
            return sessionData.map((s) => {
                return {
                    sessionId: s.sessionId,
                    userId: s.userId,
                    expiresAt: s.expiresAt,
                    stayLoggedIn: s.stayLoggedIn,
                    os: !!s.os ? s.os : undefined,
                    agent: !!s.agent ? s.agent : undefined,
                };
            });
        }
        if (!(sessionData instanceof UserSessionDto) || sessionData.sessionId) {
            const session = sessionData as UserSessionDto;
            return {
                sessionId: session.sessionId,
                userId: session.userId,
                expiresAt: session.expiresAt,
                stayLoggedIn: session.stayLoggedIn,
                os: !!session.os ? session.os : undefined,
                agent: !!session.agent ? session.agent : undefined,
            };
        }
    }

    private async asyncFind(array, findFunction) {
        for (const item of array) {
            if (await findFunction(await item)) {
                return item;
            }
        }
        return undefined;
    }
}
