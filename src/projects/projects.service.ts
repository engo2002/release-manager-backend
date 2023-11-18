import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import { Project } from './entity/project.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) {}

    async findAll(): Promise<Project[]> {
        return await this.projectRepository.find({ relations: ["releases"]});
    }

    async findOne(id: string): Promise<Project> {
        const project = await this.projectRepository.findOne({where: { id: id }, relations: ["releases"]});
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    async create(projectData: Partial<Project>): Promise<Project> {
        const newProject = this.projectRepository.create(projectData);
        return await this.projectRepository.save(newProject);
    }

    async update(id: string, projectData: Partial<Project>): Promise<Project> {
        await this.projectRepository.update(id, projectData);
        const updatedProject = await this.findOne(id);
        if (!updatedProject) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return updatedProject;
    }

    async remove(id: string): Promise<boolean> {
        const deleteResult = await this.projectRepository.delete({id: id});
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return true;
    }

}
