import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put} from '@nestjs/common';
import {Release} from './entity/release.entity';
import {ReleaseField} from './entity/release-field.entity';
import {CreateEditReleaseDto} from './dto/create-edit-release.dto';
import {ApiBody, ApiParam, ApiResponse, ApiTags, PartialType} from '@nestjs/swagger';
import {ReleaseService} from './releases.service';

@ApiTags('releases')
@Controller('releases')
export class ReleaseController {
    constructor(private readonly releaseService: ReleaseService) {}

    @Get()
    @ApiResponse({ type: Release, isArray: true })
    async findAllReleases(): Promise<Release[]> {
        return this.releaseService.findAllReleases();
    }

    @Get(':id')
    @ApiParam({ name: "id", description: "releaseId"})
    @ApiResponse({ type: Release })
    async findReleaseById(@Param('id') id: string): Promise<Release> {
        const release = await this.releaseService.findReleaseById(id);
        if (!release) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return release;
    }

    @Get('project/:projectId')
    @ApiParam({ name: "projectId", description: "projectId"})
    @ApiResponse({ type: Release, isArray: true })
    async findReleasesByProjectId(@Param('projectId') projectId: string): Promise<Release[]> {
        return await this.releaseService.getReleaseForProject(projectId);
    }

    @Get('project/:projectId/release/:releaseNumber')
    @ApiParam({ name: "projectId", description: "projectId"})
    @ApiParam({ name: "releaseNumber", description: "Release Number"})
    @ApiResponse({ type: Release})
    async findReleaseByProjectIdAndReleaseNumber(@Param('projectId') projectId: string, @Param('releaseNumber') releaseNumber: string): Promise<Release> {
        return await this.releaseService.findReleaseByProjectIdAndReleaseNumber(projectId, releaseNumber);
    }

    @Post("project/:projectId/release")
    @ApiResponse({ type: Release })
    @ApiParam({ name: "projectId", description: "projectId"})
    @ApiBody({ type: CreateEditReleaseDto })
    async createRelease(@Param("projectId") projectId: string,@Body() createReleaseDto: CreateEditReleaseDto): Promise<Release> {
        return this.releaseService.createReleaseWithFields(createReleaseDto, projectId);
    }

    @Put(':id/fields/:fieldType')
    @ApiResponse({ type: Release })
    @ApiParam({ name: "id", description: "releaseId"})
    @ApiParam({ name: "fieldType", description: "e.g. majorField, minorField, bugfixField, otherField"})
    @ApiBody({ type: PartialType(ReleaseField) })
    async addReleaseField(
        @Param('id') releaseId: string,
        @Param('fieldType') fieldType: string,
        @Body() fieldData: Partial<ReleaseField>,
    ): Promise<Release> {
        return this.releaseService.addReleaseField(releaseId, fieldType, fieldData);
    }

    @Put(':id')
    @ApiResponse({ type: Release })
    @ApiParam({ name: "id", description: "releaseId"})
    @ApiBody({ type: CreateEditReleaseDto })
    async updateRelease(
        @Param('id') id: string,
        @Body() releaseData: CreateEditReleaseDto,
    ): Promise<Release> {
        const updatedRelease = await this.releaseService.updateRelease(id, releaseData);
        if (!updatedRelease) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return updatedRelease;
    }

    @Delete(':id')
    @ApiResponse({ type: Boolean })
    @ApiParam({ name: "id", description: "releaseId"})
    async deleteRelease(@Param('id') id: string): Promise<boolean> {
        const deleted = await this.releaseService.deleteRelease(id);
        if (!deleted) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return deleted;
    }
}
