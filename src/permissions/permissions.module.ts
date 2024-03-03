import { forwardRef, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { RolesModule } from "src/roles/roles.module";
import { UsersModule } from "src/users/users.module";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";

@Module({
    controllers: [PermissionsController],
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RolesModule),
        PassportModule.register({
            defaultStrategy: "jwt",
            property: "user",
            session: false,
        }),
    ],
    providers: [PermissionsService],
    exports: [PermissionsService],
})
export class PermissionsModule {}
