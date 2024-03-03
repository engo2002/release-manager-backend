import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RolesService } from "src/roles/roles.service";
import { RolePermissionsDefinition } from "./definition/rolePermissions.definition";
import { MergedUserRolePermissions } from "./interfaces/mergedUserPermissions.interface";
import { Permissions } from "./interfaces/permissions.interface";
import { RoleDefinition } from "./interfaces/roleDefinition.interface";

@Injectable()
export class PermissionsService {
    perms: RoleDefinition[];

    constructor(private rolesService: RolesService) {
        this.perms = [];
        this.perms = RolePermissionsDefinition();
    }

    private static mergeResultToResult(mergeResult: {}, primaryRole: string, secondaryRole: string) {
        const result: MergedUserRolePermissions = {
            ...mergeResult as Permissions,
            primaryRole: primaryRole,
            secondaryRole: secondaryRole,
        };
        return result;
    }

    async getUserPermissions(userId: string): Promise<Permissions> {
        const roles = await this.getUserRoles(userId);
        if (roles) {
            if (roles.primaryRole && roles.secondaryRole !== null && roles.secondaryRole !== undefined && roles.secondaryRole !== "") {
                const primaryPerms: Permissions = this.perms[roles.primaryRole];
                const secondaryPerms: Permissions = this.perms[roles.secondaryRole];
                const mergeResult: {} = {};

                for (const [keyP, valueP] of Object.entries(primaryPerms)) {
                    if (keyP !== "role") {
                        if (primaryPerms[keyP] === true) {
                            mergeResult[keyP] = valueP;
                        } else {
                            if (primaryPerms[keyP] === secondaryPerms[keyP]) {
                                mergeResult[keyP] = valueP;
                            }
                            if (primaryPerms[keyP] !== secondaryPerms[keyP]) {
                                if (secondaryPerms[keyP] === true) {
                                    mergeResult[keyP] = true;
                                } else {
                                    mergeResult[keyP] = valueP;
                                }
                            } else {
                                mergeResult[keyP] = valueP;
                            }
                        }
                    }
                }
                return PermissionsService.mergeResultToResult(mergeResult, roles.primaryRole, roles.secondaryRole);
            } else {
                return PermissionsService.mergeResultToResult(this.perms[roles.primaryRole], roles.primaryRole, roles.secondaryRole);
            }
        } else {
            throw new HttpException("No Roles for User found", HttpStatus.NOT_FOUND);
        }
    }

    async getUserRoles(userId: string) {
        return await this.rolesService.getUserRoles(userId);
    }
}
