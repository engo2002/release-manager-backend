import {HttpException, HttpStatus, Inject, Injectable, Logger} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {UserSessionRefreshService} from "../user-session-refresh/user-session-refresh.service";
import {LoginUserDto} from "../users/dto/loginUser.dto";
import {CreateUserDto} from "../users/dto/createUser.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {TwoFactorAuthService} from "./two-factor-auth/two-factor-auth.service";
import {RegisterDto} from "./interfaces/register.dto";
import {ValidateLoginDto} from "./interfaces/validateLogin.dto";
import {LoginStatus} from "./interfaces/loginStatus.interface";
import {UserService} from "../users/user.service";
import {UserDto} from "../users/dto/user.dto";
import {UserSessionRefreshEntity} from "../user-session-refresh/entity/UserSessionRefresh.entity";
import {jwtDecode} from "jwt-decode";
import {GeneralUserDataDto} from "../users/dto/GeneralUserData.dto";
import * as _ from "lodash";
import * as bcrypt from "bcrypt";
import {JwtPayload} from "./interfaces/jwtPayload.interface";
import {UserSessionDto} from "../user-session-refresh/dto/UserSessionDto";
import UAParser from "ua-parser-js";
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly usersService: UserService,
        private readonly userSessionRefreshService: UserSessionRefreshService,
        private readonly jwtService: JwtService,
        private twoFactorService: TwoFactorAuthService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async register(userDto: CreateUserDto): Promise<RegisterDto> {
        return await this.usersService.create(userDto);
    }

    async validateLogin(loginUserDto: LoginUserDto): Promise<ValidateLoginDto> {
        const user = await this.usersService.findByLogin(loginUserDto);

        await this.usersService.setFailedLoginCounter(user, "reset");
        return {
            credentialsValid: !!user,
            twoFactorEnabled: !!user.isTwoFactorAuthenticationEnabled ? user.isTwoFactorAuthenticationEnabled : undefined,
        };
    }

    async login(loginUserDto: LoginUserDto, request): Promise<LoginStatus> {
        // find user in db
        const user = await this.usersService.findByLogin(loginUserDto);

        if (user.isTwoFactorAuthenticationEnabled) {
            if (_.isEmpty(loginUserDto.code)) {
                await this.usersService.setFailedLoginCounter(user, "incr");
                throw new HttpException("2fa code required", HttpStatus.PRECONDITION_REQUIRED);
            }
            if (!(await this.twoFactorService.isTwoFactorValid(loginUserDto.code, user.id))) {
                await this.usersService.setFailedLoginCounter(user, "incr");
                throw new HttpException("2fa code not valid", HttpStatus.PRECONDITION_FAILED);
            }
        }

        // generate and sign token
        const token = await this.createAccessToken(user);

        // generate and sign refreshToken
        const refreshToken = await this.createOrRenewRefreshToken(user, request, loginUserDto.stayLoggedIn);

        await this.usersService.setFailedLoginCounter(user, "reset");

        await this.usersService.setLastLoginDate(user.id);

        return {
            userId: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            refreshToken: refreshToken.refreshToken,
            refreshExpiresIn: refreshToken.refreshExpiresIn,
            session: refreshToken.session,
            avatar: user.avatar,
            ...token,
        };
    }

    async validateUser(payload: any): Promise<UserDto> {
        const user = await this.usersService.findByPayload(payload);
        if (!user) {
            throw new HttpException("Invalid token", HttpStatus.BAD_REQUEST);
        }
        return user;
    }

    async validateToken() {
        const token = await this.cacheManager.get<string>("bearer");
        if (!_.isEmpty(token)) {
            try {
                const verifyResult = this.jwtService.verify(token);
                if (verifyResult) {
                    const userData = await this.getUserDataByUsername(verifyResult.username);
                    verifyResult.user = userData.id;
                    verifyResult.fullname = userData.fullname;
                    verifyResult.avatar = userData.avatar;
                    return verifyResult;
                }
            } catch (error) {
                throw new HttpException("Invalid token or expired", HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException("No token specified", HttpStatus.BAD_REQUEST);
        }
    }

    async validateRefreshToken(refreshToken: string, userId: string, sessionId?: string) {
        const isOnTokenBlacklist = !!await this.userSessionRefreshService.checkTokenBlacklistByToken(refreshToken);
        if (!_.isEmpty(refreshToken) && !_.isEmpty(userId) && !isOnTokenBlacklist) {
            const userData = await this.usersService.findById(userId);
            let sessionData: UserSessionRefreshEntity;
            if (!_.isEmpty(sessionId)) {
                sessionData = await this.userSessionRefreshService.getSessionBySessionIdAsEntity(sessionId);
            } else {
                sessionData = await this.userSessionRefreshService.getSessionByRefreshTokenAndUserId(refreshToken, userData.id);
            }
            if (!_.isEmpty(sessionData)) {
                const isSessionUserMatching = sessionData.userId === userData.id;
                if (isSessionUserMatching) {
                    try {
                        const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_TOKEN_SECRET, ignoreExpiration: true });
                        if (payload && !_.isEmpty(payload.userId)) {
                            const isPayloadUserMatching = payload.userId === userData.id;
                            if (isPayloadUserMatching) {
                                payload.id = userData.id;
                                payload.fullname = userData.fullname;
                                return payload;
                            }
                        }
                    } catch (error) {
                        await this.userSessionRefreshService.deleteSessionBySessionId(sessionData.sessionId);
                        throw new HttpException("Authentication Error 4", HttpStatus.UNAUTHORIZED); // Invalid refresh token or user not valid
                    }
                } else {
                    await this.userSessionRefreshService.deleteSessionBySessionId(sessionData.sessionId);
                    throw new HttpException("Authentication Error 3", HttpStatus.UNAUTHORIZED); // UserId from session does not match with provided userId.
                }
            } else {
                throw new HttpException("Authentication Error 2", HttpStatus.UNAUTHORIZED); // No matching session found
            }
        } else {
            if (isOnTokenBlacklist) {
                throw new HttpException("Authentication Error 5", HttpStatus.UNAUTHORIZED) // Token is on blacklist
            }
            throw new HttpException("Authentication Error 1", HttpStatus.UNAUTHORIZED); //No token or userId
        }
    }

    async refreshSession(refreshToken: string, request, sessionId: string) {
        if (!_.isEmpty(refreshToken)) {
            const payload: any = jwtDecode(refreshToken);
            const session = await this.userSessionRefreshService.getSessionBySessionIdAsEntity(sessionId);
            if (_.isEmpty(session)) {
                const allSessions = await this.userSessionRefreshService.getSessions();
                this.logger.warn(JSON.stringify(allSessions));
                this.logger.warn(
                    JSON.stringify({
                        sessionId: sessionId,
                        refreshToken: refreshToken,
                        payload: JSON.stringify(payload),
                    })
                );
                throw new HttpException("session not found", HttpStatus.BAD_REQUEST);
            }
            if (payload.userId !== session.userId) {
                throw new HttpException("provided user id from token does not match to session", HttpStatus.BAD_REQUEST);
            }
            const user = await this.usersService.findById(payload.userId);
            const result = await this.validateRefreshToken(refreshToken, payload.userId, sessionId);
            if (result) {
                return {
                    ...(await this.createAccessToken(result)),
                    ...(await this.createOrRenewRefreshToken(user, request, session.stayLoggedIn, sessionId)),
                };
            }
        } else {
            throw new HttpException("no refresh token specified", HttpStatus.BAD_REQUEST);
        }
    }

    async updatePassword(username: string, oldPassword: string, newPassword: string, newPasswordCheck: string) {
        return await this.usersService.updatePassword(username, oldPassword, newPassword, newPasswordCheck);
    }

    async updatePasswordAdmin(username: string, newPassword: string, newPasswordCheck: string) {
        return await this.usersService.updatePasswordAdmin(username, newPassword, newPasswordCheck);
    }

    async getGeneralUserData(id: string): Promise<GeneralUserDataDto> {
        return await this.usersService.findOneByIdToGeneralData(id);
    }

    async getUserFullnameById(id: string): Promise<string> {
        const user = await this.usersService.findOneToUserDto({ where: { id } });
        if (_.isEmpty(user) || _.isEmpty(user.fullname)) {
            return "Unbekannter Benutzer";
        } else {
            return user.fullname;
        }
    }

    async getUserDataByUsername(username: string): Promise<UserDto> {
        return await this.usersService.findOneToUserDto({ where: { username } });
    }

    async getAllUser(): Promise<GeneralUserDataDto[]> {
        return await this.usersService.findAll();
    }

    async deleteUser(userId: string) {
        return await this.usersService.deleteUser(userId);
    }

    async logout(refreshToken: string) {
        await this.userSessionRefreshService.deleteSessionByRefreshTokenIfExists(refreshToken);
    }

    async isDefaultUserActive() {
        const entry = await this.usersService.findOneEntity({ where: { username: "default" } });
        if (!!entry) {
            return await bcrypt.compare("default", entry.password);
        }
        return false;
    }

    private createAccessToken(user: UserDto): any {
        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        });
        return {
            accessToken: accessToken,
            accessExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
        };
    }

    private async createOrRenewRefreshToken(user: UserDto, request, stayLoggedIn?: boolean, sessionId?: string) {
        const payload: JwtPayload = {
            userId: user.id,
            username: user.username,
        };
        const expiration = stayLoggedIn ? process.env.JWT_REFRESH_TOKEN_EXPIRATION_STAY_LOGGED_IN : process.env.JWT_REFRESH_TOKEN_EXPIRATION_DEFAULT;
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expiresIn: expiration,
        });
        const userId = (await this.usersService.findByPayload(payload)).id;
        const session = !_.isEmpty(sessionId) ? await this.updateSessionEntity(sessionId, userId, refreshToken, request, stayLoggedIn) : await this.createSessionEntity(userId, refreshToken, request, stayLoggedIn);
        return {
            refreshExpiresIn: expiration,
            refreshToken: refreshToken,
            session: session,
        };
    }

    private async updateSessionEntity(sessionId: string, userId: string, refreshToken: string, request, stayLoggedIn) {
        const { decode, os, browserName } = this.getAgentData(refreshToken, request);
        return await this.userSessionRefreshService.putSession(sessionId, {
            userId: userId,
            refreshToken: refreshToken,
            expiresAt: (decode.exp * 1000).toString(),
            stayLoggedIn: stayLoggedIn,
            os: !!os ? os.replace(/(^"|"$)/g, "") : undefined,
            agent: !!browserName ? browserName : undefined,
        });
    }

    private async createSessionEntity(userId: string, refreshToken: string, request, stayLoggedIn: boolean): Promise<UserSessionDto> {
        const { decode, os, browserName } = this.getAgentData(refreshToken, request);
        return await this.userSessionRefreshService.postSession({
            userId: userId,
            refreshToken: refreshToken,
            expiresAt: (decode.exp * 1000).toString(),
            stayLoggedIn: stayLoggedIn,
            os: !!os ? os.replace(/(^"|"$)/g, "") : undefined,
            agent: !!browserName ? browserName : undefined,
        });
    }

    private getAgentData(refreshToken: string, request) {
        const decode: any = jwtDecode(refreshToken);
        const os = request.headers["sec-ch-ua-platform"] as string;
        const agent = request.headers["user-agent"];
        const parser = new UAParser();
        const browserName = parser.setUA(agent).getBrowser().name;
        return { decode, os, browserName };
    }
}
