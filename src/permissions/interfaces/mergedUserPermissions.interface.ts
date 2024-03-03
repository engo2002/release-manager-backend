import { Permissions } from "./permissions.interface";

export interface MergedUserRolePermissions extends Permissions {
    primaryRole: string;
    secondaryRole: string;
}
