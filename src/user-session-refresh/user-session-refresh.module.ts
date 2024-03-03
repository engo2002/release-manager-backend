import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { PermissionsModule } from "../permissions/permissions.module";
import { UserSessionRefreshEntity } from "./entity/UserSessionRefresh.entity";
import { UserSessionRefreshController } from "./user-session-refresh.controller";
import { UserSessionRefreshService } from "./user-session-refresh.service";
import {TokenBlacklistEntity} from "./entity/tokenBlacklist.entity";

@Module({
    providers: [UserSessionRefreshService],
    imports: [TypeOrmModule.forFeature([UserSessionRefreshEntity, TokenBlacklistEntity]), forwardRef(() => AuthModule), forwardRef(() => PermissionsModule)],
    exports: [UserSessionRefreshService],
    controllers: [UserSessionRefreshController],
})
export class UserSessionRefreshModule {}
