import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import { Cache } from "cache-manager";
import * as _ from "lodash";
import { CreateUserDto } from "src/users/dto/createUser.dto";
import { LoginUserDto } from "src/users/dto/loginUser.dto";
import { updateUserPasswordDto } from "src/users/dto/updateUserPassword.dto";
import { updateUserPasswordAdminDto } from "src/users/dto/updateUserPasswordAdmin.dto";
import { GeneralUserDataDto } from "../users/dto/GeneralUserData.dto";
import { GetTokenGuard } from "./GetToken.guard";
import { AuthService } from "./auth.service";
import { LoginStatus } from "./interfaces/loginStatus.interface";
import { RegisterDto } from "./interfaces/register.dto";
import { ValidateLoginDto } from "./interfaces/validateLogin.dto";
import { Permissions } from "./permissions.decorator";
import { PermissionsGuard } from "./permissions.guard";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
    constructor(private readonly authService: AuthService, @Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @Post("register")
    public async register(@Body() createUserDto: CreateUserDto): Promise<RegisterDto> {
        return this.authService.register(createUserDto);
    }

    @Post("login")
    public async login(@Body() loginUserDto: LoginUserDto, @Req() request): Promise<LoginStatus> {
        return await this.authService.login(loginUserDto, request);
    }

    @Post("validateLogin/")
    @ApiBody({ type: LoginUserDto })
    @ApiResponse({ type: ValidateLoginDto })
    public async validateLogin(@Body() body: LoginUserDto): Promise<ValidateLoginDto> {
        return await this.authService.validateLogin(body);
    }

    @UseGuards(AuthGuard(), GetTokenGuard)
    @Get("validateToken/")
    public async validateToken() {
        return this.authService.validateToken();
    }

    @UseGuards(GetTokenGuard)
    @Get("validateRefreshToken/:userId/:sessionId")
    @ApiParam({
        name: "userId",
        required: true,
        type: "string",
    })
    @ApiParam({
        name: "sessionId",
        required: false,
        type: "string",
    })
    public async validateRefreshToken(@Param() params) {
        const refreshToken = await this.cacheManager.get<string>("bearer");
        return this.authService.validateRefreshToken(refreshToken, params.userId, params.sessionId);
    }

    @Get("refresh")
    @ApiBearerAuth("JWT-auth")
    @ApiQuery({
        name: "sessionId",
        required: false,
        type: "string",
    })
    async refresh(@Req() request: any, @Query("sessionId") sessionId?: string) {
        if (sessionId === "null" || sessionId === "undefined") {
            sessionId = undefined;
        }
        if (request.headers.authorization) {
            const refreshToken = request.headers.authorization.replace("Bearer", "").trim();
            if (!_.isEmpty(refreshToken)) {
                return await this.authService.refreshSession(refreshToken.toString(), request, sessionId);
            } else {
                throw new HttpException("no refresh key as bearer token", HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException("no refresh key as bearer token", HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @Put("changepassword")
    public async updatePw(@Body() updateUserData: updateUserPasswordDto) {
        return await this.authService.updatePassword(updateUserData.username, updateUserData.oldPassword, updateUserData.newPassword, updateUserData.newPasswordCheck);
    }

    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @Put("changepasswordAdmin")
    public async updatePwAdmin(@Body() updateUserData: updateUserPasswordAdminDto) {
        return await this.authService.updatePasswordAdmin(updateUserData.username, updateUserData.newPassword, updateUserData.newPasswordCheck);
    }

    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @Get("isDefaultUserActive")
    public async isDefaultUserActive(): Promise<boolean> {
        return await this.authService.isDefaultUserActive();
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @Get("generalUserData/:id")
    @ApiParam({ name: "id", required: true, type: "string" })
    @ApiResponse({ type: GeneralUserDataDto })
    public async getGeneralUserDataById(@Param() params): Promise<GeneralUserDataDto> {
        return await this.authService.getGeneralUserData(params.id);
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @Get("userFullname/:id")
    @ApiParam({ name: "id", required: true, type: "string" })
    public async getUserFullnameById(@Param() params): Promise<string> {
        return await this.authService.getUserFullnameById(params.id);
    }

    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @Get("userData")
    @ApiResponse({ type: GeneralUserDataDto, isArray: true })
    public async getAllUser(): Promise<GeneralUserDataDto[]> {
        return await this.authService.getAllUser();
    }

    @UseGuards(GetTokenGuard)
    @ApiBearerAuth("JWT-auth")
    @Post("logout")
    public async logoutUser(@Param() params) {
        const refreshToken = await this.cacheManager.get<string>("bearer");
        return this.authService.logout(refreshToken);
    }
}
