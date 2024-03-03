import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as _ from "lodash";
import { Permissions } from "../permissions.decorator";
import { PermissionsGuard } from "../permissions.guard";
import { TwoFactorDto } from "./dto/twoFactor.dto";
import { TwoFactorCreateDto } from "./dto/twoFactorCreate.dto";
import { TwoFactorDeleteDto } from "./dto/twoFactorDelete.dto";
import { TwoFactorLoginDto } from "./dto/twoFactorLogin.dto";
import { TwoFactorAuthService } from "./two-factor-auth.service";

@Controller("2fa")
@ApiTags("Two Factor Authentication")
export class TwoFactorAuthController {
    constructor(private twoFactorService: TwoFactorAuthService) {}

    @ApiQuery({ name: "userId", required: false, type: "string" })
    @ApiQuery({ name: "username", required: false, type: "string" })
    @Get("active")
    public async getActive(@Query() query): Promise<boolean> {
        if (!_.isEmpty(query.userId)) {
            return await this.twoFactorService.getActive(query.userId);
        }

        if (!_.isEmpty(query.username)) {
            return await this.twoFactorService.getActive(undefined, query.username);
        }

        throw new HttpException("You have to provide userId or username (e-mail)!", HttpStatus.BAD_REQUEST);
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiBody({ type: TwoFactorCreateDto })
    @Post("generate")
    @ApiResponse({ type: TwoFactorDto })
    public async generateQrCode(@Body() body: TwoFactorCreateDto): Promise<TwoFactorDto> {
        return await this.twoFactorService.generateTwoFactorAuthenticationSecret(body);
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiBody({ type: TwoFactorLoginDto })
    @Post("setActive")
    public async set2FaActiveForUser(@Body() body: TwoFactorLoginDto) {
        return await this.twoFactorService.set2faActive(body);
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiBody({ type: TwoFactorDeleteDto })
    @Post("delete")
    public async delete2Fa(@Body() body: TwoFactorDeleteDto) {
        return this.twoFactorService.remove2fa(body);
    }

    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @ApiBody({ type: TwoFactorDeleteDto })
    @Post("reset/:userId")
    @ApiParam({ name: "userId", required: true, type: "string" })
    public async reset2Fa(@Param("userId") userId: string) {
        return this.twoFactorService.reset2fa(userId);
    }
}
