import { forwardRef, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { PermissionsModule } from "src/permissions/permissions.module";
import { RolesEntity } from "./entity/roles.entity";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
    controllers: [RolesController],
    imports: [
        TypeOrmModule.forFeature([RolesEntity]),
        PassportModule.register({
            defaultStrategy: "jwt",
            property: "user",
            session: false,
        }),
        forwardRef(() => AuthModule),
        forwardRef(() => PermissionsModule),
    ],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule {}
