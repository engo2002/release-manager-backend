import {forwardRef, Module} from '@nestjs/common';
import { UserService } from './user.service';
import {AuthModule} from "../auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./entity/user.entity";
import {PermissionsModule} from "../permissions/permissions.module";
import {UserSessionRefreshModule} from "../user-session-refresh/user-session-refresh.module";
import {PassportModule} from "@nestjs/passport";
import {RolesModule} from "../roles/roles.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        forwardRef(() => RolesModule),
        PassportModule.register({
            defaultStrategy: "jwt",
            property: "user",
            session: false,
        }),
        UserSessionRefreshModule,
        forwardRef(() => PermissionsModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}
