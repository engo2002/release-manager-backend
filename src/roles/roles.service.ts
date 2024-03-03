import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { createRolesDto } from "./dto/createRolesDto.dto";
import { rolesDto } from "./dto/rolesDto.dto";
import { RolesEntity } from "./entity/roles.entity";
import { getRolesDefinition } from "./interface/roles.definition";

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(RolesEntity)
        private rolesRepo: Repository<RolesEntity>
    ) {}

    getRolesDefinition(): string[] {
        return getRolesDefinition();
    }

    async getUserRoles(userId: string): Promise<RolesEntity> {
        const userPerm = await this.rolesRepo.findOne({
            select: ["id", "primaryRole", "secondaryRole", "user"],
            where: [{ user: userId }],
        });
        if (!userPerm) {
            throw new HttpException("PermissionDefinition not found", HttpStatus.NOT_FOUND);
        }

        return userPerm;
    }

    async getAll(): Promise<RolesEntity[]> {
        return await this.rolesRepo.find();
    }

    async createUserRoles(createRolesDto: createRolesDto) {
        const roles = new RolesEntity();
        roles.primaryRole = createRolesDto.primaryRole;
        roles.secondaryRole = createRolesDto.secondaryRole;
        roles.user = createRolesDto.user;

        return await this.rolesRepo.save(roles);
    }

    async updateUserRoles(userId: string, rolesDto: rolesDto) {
        const rolesData = await this.rolesRepo.find({
            select: ["id"],
            where: [{ user: userId }],
        });
        await this.rolesRepo.update(rolesData[0].id, rolesDto);
    }

    async deleteUserRoles(userId: string) {
        const find = await this.getUserRoles(userId);
        return await this.rolesRepo.delete(find.id);
    }
}
