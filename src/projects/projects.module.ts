import {Module} from '@nestjs/common';
import {ProjectsService} from './projects.service';
import {ProjectsController} from './projects.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Project} from "./entity/project.entity";
import {PermissionsModule} from "../permissions/permissions.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
    imports: [
        TypeOrmModule.forFeature([Project], "default"),
        PermissionsModule,
        AuthModule
    ]
})
export class ProjectsModule {}
