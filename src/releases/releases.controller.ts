import {Body, Controller, Delete, Get, NotFoundException, Param, Post, Put} from '@nestjs/common';
import {Release} from './entity/release.entity';
import {ReleaseField} from './entity/release-field.entity';
import {CreateReleaseDto} from './dto/create-release.dto';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
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
    @ApiResponse({ type: Release })
    async findReleaseById(@Param('id') id: string): Promise<Release> {
        const release = await this.releaseService.findReleaseById(id);
        if (!release) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return release;
    }

    @Post()
    @ApiResponse({ type: Release })
    async createRelease(@Body() createReleaseDto: CreateReleaseDto): Promise<Release> {
        return this.releaseService.createReleaseWithFields(createReleaseDto);
    }

    @Put(':id/fields/:fieldType')
    @ApiResponse({ type: Release })
    async addReleaseField(
        @Param('id') releaseId: string,
        @Param('fieldType') fieldType: string,
        @Body() fieldData: Partial<ReleaseField>,
    ): Promise<Release> {
        return this.releaseService.addReleaseField(releaseId, fieldType, fieldData);
    }

    @Put(':id')
    @ApiResponse({ type: Release })
    async updateRelease(
        @Param('id') id: string,
        @Body() releaseData: Partial<Release>,
    ): Promise<Release> {
        const updatedRelease = await this.releaseService.updateRelease(id, releaseData);
        if (!updatedRelease) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return updatedRelease;
    }

    @Delete(':id')
    @ApiResponse({ type: Boolean })
    async deleteRelease(@Param('id') id: string): Promise<boolean> {
        const deleted = await this.releaseService.deleteRelease(id);
        if (!deleted) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return deleted;
    }
}
