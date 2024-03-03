import { RoleDefinition } from "../interfaces/roleDefinition.interface";

export function RolePermissionsDefinition(): RoleDefinition[] {
    const perms: RoleDefinition[] = [];
    perms["Admin"] = {
        role: "Admin",
        canReadUsers: true,
        canWriteUsers: true,
        canDeleteUsers: true,
        canReadProjects: true,
        canWriteProjects: true,
        canDeleteProjects: true,
        canReadReleases: true,
        canWriteReleases: true,
        canDeleteReleases: true,
    };

    perms["Viewer"] = {
        role: "Viewer",
        canReadUsers: true,
        canWriteUsers: false,
        canDeleteUsers: false,
        canReadProjects: true,
        canWriteProjects: false,
        canDeleteProjects: false,
        canReadReleases: true,
        canWriteReleases: false,
        canDeleteReleases: false,
    };

    return perms;
}
