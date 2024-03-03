import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards} from '@nestjs/common';
import {ProjectsService} from './projects.service';
import {Project} from './entity/project.entity';
import {ApiBearerAuth, ApiResponse, ApiTags} from '@nestjs/swagger';
import {CreateProjectDto} from './dto/create-project.dto';
import {UpdateProjectDto} from './dto/update-project.dto';
import {AuthGuard} from "@nestjs/passport";
import {PermissionsGuard} from "../auth/permissions.guard";
import {Permissions} from "../auth/permissions.decorator";

@ApiTags('projects') // Optional: Definiert Tags für Swagger
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get()
    @ApiResponse({ type: Project, isArray: true })
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canReadProjects")
    @ApiBearerAuth("JWT-auth")
    async findAll(): Promise<Project[]> {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiResponse({ type: Project })
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canReadProjects")
    @ApiBearerAuth("JWT-auth")
    async findOne(@Param('id') id: string): Promise<Project> {
        const project = await this.projectsService.findOne(id);
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    @Post()
    @ApiResponse({ type: Project })
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteProjects")
    @ApiBearerAuth("JWT-auth")
    async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
        return this.projectsService.create(createProjectDto);
    }

    @Put(':id')
    @ApiResponse({ type: Project })
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteProjects")
    @ApiBearerAuth("JWT-auth")
    async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto): Promise<Project> {
        const updatedProject = await this.projectsService.update(id, updateProjectDto);
        if (!updatedProject) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return updatedProject;
    }

    @Delete(':id')
    @ApiResponse({ type: Boolean })
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canDeleteProjects")
    @ApiBearerAuth("JWT-auth")
    async remove(@Param('id') id: string): Promise<boolean> {
        const deleted = await this.projectsService.remove(id);
        if (!deleted) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return deleted;
    }
}
