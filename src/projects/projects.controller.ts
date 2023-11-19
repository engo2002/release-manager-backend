import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entity/project.entity';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects') // Optional: Definiert Tags für Swagger
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    @ApiResponse({ type: Project, isArray: true })
    async findAll(): Promise<Project[]> {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiResponse({ type: Project })
    async findOne(@Param('id') id: string): Promise<Project> {
        const project = await this.projectsService.findOne(id);
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    @Post()
    @ApiResponse({ type: Project })
    async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
        return this.projectsService.create(createProjectDto);
    }

    @Put(':id')
    @ApiResponse({ type: Project })
    async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto): Promise<Project> {
        const updatedProject = await this.projectsService.update(id, updateProjectDto);
        if (!updatedProject) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return updatedProject;
    }

    @Delete(':id')
    @ApiResponse({ type: Boolean })
    async remove(@Param('id') id: string): Promise<boolean> {
        const deleted = await this.projectsService.remove(id);
        if (!deleted) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return deleted;
    }
}
