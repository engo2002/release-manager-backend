import {HttpException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Release} from './entity/release.entity';
import {ReleaseField} from './entity/release-field.entity';
import {ReleaseFieldDto} from './dto/release-field.dto';
import {CreateEditReleaseDto} from './dto/create-edit-release.dto';

@Injectable()
export class ReleaseService {
    constructor(
        @InjectRepository(Release)
        private readonly releaseRepository: Repository<Release>,
        @InjectRepository(ReleaseField)
        private readonly releaseFieldRepository: Repository<ReleaseField>,
    ) {}

    async findAllReleases(): Promise<Release[]> {
        return await this.releaseRepository.find({relations: ["fields"]});
    }

    async getReleaseForProject(projectId: string) {
        return await this.releaseRepository.find({
            where: {
                projectId: projectId
            }
        })
    }

    async findReleaseById(id: string): Promise<Release> {
        const release = await this.releaseRepository.findOne({ where: {
            id: id
            }, relations: ["fields"] });
        if (!release) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return release;
    }

    async createRelease(releaseData: Partial<Release>): Promise<Release> {
        const newRelease = this.releaseRepository.create(releaseData);
        return await this.releaseRepository.save(newRelease);
    }

    async updateRelease(id: string, releaseData: CreateEditReleaseDto): Promise<Release> {
        const release = await this.releaseRepository.save({
            id: id,
            releaseNumber: releaseData.releaseNumber,
            headline: releaseData.headline
        });
        await this.deleteReleaseFieldsForRelease(release.id);
        await Promise.all([
            this.createFieldForRelease(release, 'majorField', releaseData.majorField),
            this.createFieldForRelease(release, 'minorField', releaseData.minorField),
            this.createFieldForRelease(release, 'bugfixField', releaseData.bugfixField),
            this.createFieldForRelease(release, 'otherField', releaseData.otherField),
        ]);

        return await this.findReleaseById(id);
    }

    async deleteReleaseFieldsForRelease(releaseId: string) {
        return await this.releaseFieldRepository.delete({ releaseId: releaseId });

    }

    async deleteRelease(id: string): Promise<boolean> {
        const deleteResult = await this.releaseRepository.delete(id);
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return true;
    }

    async addReleaseField(releaseId: string, fieldType: string, fieldData: Partial<ReleaseField>): Promise<Release> {
        const release = await this.releaseRepository.findOne({ where: {id: releaseId}, relations: ['fields'] });

        if (!release) {
            throw new NotFoundException(`Release with ID ${releaseId} not found`);
        }

        const newField = this.releaseFieldRepository.create(fieldData);
        newField.showInWhatsNew = true; // Default value for showInWhatsNew, could be changed as needed
        await this.releaseFieldRepository.save(newField);

        switch (fieldType) {
            case 'major':
                release.majorField = newField;
                break;
            case 'minor':
                release.minorField = newField;
                break;
            case 'bugfix':
                release.bugfixField = newField;
                break;
            case 'other':
                release.otherField = newField;
                break;
            default:
                throw new NotFoundException(`Field type ${fieldType} not recognized`);
        }

        await this.releaseRepository.save(release);
        return release;
    }

    async createReleaseWithFields(createReleaseDto: CreateEditReleaseDto, projectId: string): Promise<Release> {
        const release = this.releaseRepository.create({
            releaseNumber: createReleaseDto.releaseNumber,
            headline: createReleaseDto.headline,
            projectId: projectId
        });

        const createdRelease = await this.releaseRepository.save(release);

        await Promise.all([
            this.createFieldForRelease(createdRelease, 'majorField', createReleaseDto.majorField),
            this.createFieldForRelease(createdRelease, 'minorField', createReleaseDto.minorField),
            this.createFieldForRelease(createdRelease, 'bugfixField', createReleaseDto.bugfixField),
            this.createFieldForRelease(createdRelease, 'otherField', createReleaseDto.otherField),
        ]);

        return createdRelease;
    }

    private async createFieldForRelease(
        release: Release,
        fieldKey: string,
        fieldData: Partial<ReleaseFieldDto>,
    ): Promise<void> {
        if (fieldData && !!fieldData.content) {
            const existingField = release[fieldKey];

            if (existingField) {
                await this.releaseFieldRepository.update(existingField.id, fieldData);
            } else {
                const newField = this.releaseFieldRepository.create(fieldData);
                newField.releaseId = release.id;
                newField.fieldType = fieldKey;

                await this.releaseFieldRepository.save(newField);
            }
        }
    }

}
