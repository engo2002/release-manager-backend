import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Release } from './entity/release.entity';
import { ReleaseField } from './entity/release-field.entity';
import { ReleaseFieldDto } from './dto/release-field.dto';
import { CreateReleaseDto } from './dto/create-release.dto';
@Injectable()
export class ReleaseService {
    constructor(
        @InjectRepository(Release)
        private readonly releaseRepository: Repository<Release>,
        @InjectRepository(ReleaseField)
        private readonly releaseFieldRepository: Repository<ReleaseField>,
    ) {}

    async findAllReleases(): Promise<Release[]> {
        return await this.releaseRepository.find();
    }

    async findReleaseById(id: string): Promise<Release> {
        const release = await this.releaseRepository.findOneBy({ id: id });
        if (!release) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return release;
    }

    async createRelease(releaseData: Partial<Release>): Promise<Release> {
        const newRelease = this.releaseRepository.create(releaseData);
        return await this.releaseRepository.save(newRelease);
    }

    async updateRelease(id: string, releaseData: Partial<Release>): Promise<Release> {
        await this.releaseRepository.update(id, releaseData);
        const updatedRelease = await this.findReleaseById(id);
        if (!updatedRelease) {
            throw new NotFoundException(`Release with ID ${id} not found`);
        }
        return updatedRelease;
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

    async createReleaseWithFields(createReleaseDto: CreateReleaseDto): Promise<Release> {
        const { releaseNumber, majorField, minorField, bugfixField, otherField } = createReleaseDto;

        const release = this.releaseRepository.create({ releaseNumber });

        const createdRelease = await this.releaseRepository.save(release);

        await Promise.all([
            this.createFieldForRelease(createdRelease, 'majorField', majorField),
            this.createFieldForRelease(createdRelease, 'minorField', minorField),
            this.createFieldForRelease(createdRelease, 'bugfixField', bugfixField),
            this.createFieldForRelease(createdRelease, 'otherField', otherField),
        ]);

        return createdRelease;
    }

    private async createFieldForRelease(
        release: Release,
        fieldKey: string,
        fieldData: Partial<ReleaseFieldDto>,
    ): Promise<void> {
        if (fieldData) {
            const existingField = release[fieldKey];

            if (existingField) {
                await this.releaseFieldRepository.update(existingField.id, fieldData);
            } else {
                const newField = this.releaseFieldRepository.create(fieldData);
                newField.showInWhatsNew = fieldData.showInWhatsNew?? true; // Default value for showInWhatsNew

                await this.releaseFieldRepository.save(newField);

                release[fieldKey] = newField;
                await this.releaseRepository.save(release);
            }
        }
    }

}
