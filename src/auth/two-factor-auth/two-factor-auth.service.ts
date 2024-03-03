import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as _ from "lodash";
import { authenticator } from "otplib";
import { TwoFactorDto } from "./dto/twoFactor.dto";
import { TwoFactorCreateDto } from "./dto/twoFactorCreate.dto";
import { TwoFactorDeleteDto } from "./dto/twoFactorDelete.dto";
import { TwoFactorLoginDto } from "./dto/twoFactorLogin.dto";
import {UserService} from "../../users/user.service";

@Injectable()
export class TwoFactorAuthService {
    constructor(private readonly usersService: UserService, private readonly configService: ConfigService) {}

    public async generateTwoFactorAuthenticationSecret(user: TwoFactorCreateDto): Promise<TwoFactorDto> {
        if (!(await this.usersService.checkPassword(user.password, user.userId))) {
            throw new HttpException("User password does not match", HttpStatus.EXPECTATION_FAILED);
        }
        const hasSecret = await this.usersService.getTwoFactorAuthenticationSecret(user.userId);
        if (!_.isEmpty(hasSecret)) {
            throw new HttpException("2fa device already connected. Remove the existing one to register a new 2fa device.", HttpStatus.BAD_REQUEST);
        }
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(user.email, this.configService.get("TWO_FACTOR_AUTHENTICATION_APP_NAME"), secret);
        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.userId);
        return {
            secret: secret,
            otpAuthUrl: otpAuthUrl,
        };
    }

    public async isTwoFactorValid(authToken: string, userId: string) {
        const secret = await this.usersService.getTwoFactorAuthenticationSecret(userId);
        return authenticator.verify({
            token: authToken,
            secret: secret,
        });
    }

    public async set2faActive(dto: TwoFactorLoginDto) {
        const isCodeValid = this.isTwoFactorValid(dto.authToken, dto.userId);
        if (!isCodeValid) {
            throw new HttpException("Wrong authentication code", HttpStatus.EXPECTATION_FAILED);
        }
        return await this.usersService.setTwoFactorEnabled(dto.userId, true);
    }

    public async remove2fa(dto: TwoFactorDeleteDto) {
        if (!(await this.usersService.checkPassword(dto.password, dto.userId))) {
            throw new HttpException("User password does not match", HttpStatus.EXPECTATION_FAILED);
        }
        await this.usersService.deleteTwoFactorAuthenticationSecret(dto.userId);
        await this.usersService.setTwoFactorEnabled(dto.userId, false);
        throw new HttpException("2fa deleted and set to inactive.", HttpStatus.OK);
    }

    public async reset2fa(userId: string) {
        await this.usersService.deleteTwoFactorAuthenticationSecret(userId);
        await this.usersService.setTwoFactorEnabled(userId, false);
        throw new HttpException("2fa deleted and set to inactive.", HttpStatus.OK);
    }

    async getActive(userId?: string, username?: string) {
        return await this.usersService.getTwoFactorEnabled(userId, username);
    }
}
