import { Permissions } from "./permissions.interface";

export interface RoleDefinition extends Permissions {
    role: string;
}
