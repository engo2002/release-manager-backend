import {Module} from '@nestjs/common';
import {ReleaseService} from './releases.service';
import {ReleaseController} from './releases.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Release} from "./entity/release.entity";
import {ReleaseField} from "./entity/release-field.entity";
import {PermissionsModule} from "../permissions/permissions.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  providers: [ReleaseService],
  controllers: [ReleaseController],
  exports: [ReleaseService],
    imports: [
        TypeOrmModule.forFeature([Release, ReleaseField], "default"),
        PermissionsModule,
        AuthModule
    ]
})
export class ReleasesModule {}
