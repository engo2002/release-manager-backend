import {forwardRef, Module} from '@nestjs/common';
import {UsersModule} from "../users/users.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {UserSessionRefreshModule} from "../user-session-refresh/user-session-refresh.module";
import {AuthController} from "./auth.controller";
import {TwoFactorAuthController} from "./two-factor-auth/two-factor-auth.controller";
import {CacheModule} from "@nestjs/cache-manager";
import {AuthService} from "./auth.service";
import {JwtStrategy} from "./jwt.strategy";
import {TwoFactorAuthService} from "./two-factor-auth/two-factor-auth.service";
import {PermissionsModule} from "../permissions/permissions.module";
import {PassportModule} from "@nestjs/passport";

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => ConfigModule),
        PassportModule.register({
            defaultStrategy: "jwt",
            property: "user",
            session: false,
        }),
        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>("JWT_ACCESS_TOKEN_SECRET"),
                    signOptions: {
                        expiresIn: config.get<string | number>("JWT_ACCESS_TOKEN_EXPIRATION"),
                    },
                };
            },
            inject: [ConfigService],
        }),
        //forwardRef(() => MailModule),
        forwardRef(() => PermissionsModule),
        UserSessionRefreshModule,
        CacheModule.register(),
    ],
    controllers: [AuthController, TwoFactorAuthController],
    providers: [AuthService, JwtStrategy, TwoFactorAuthService],
    exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
