import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Release} from "../releases/entity/release.entity";
import {Project} from "./entity/project.entity";

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
    imports: [
        TypeOrmModule.forFeature([Project], "default"),
    ]
})
export class ProjectsModule {}
