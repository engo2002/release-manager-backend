export type rolesDefinition = "Admin" | "Viewer" | "";

export function getRolesDefinition(): string[] {
    return ["Admin", "Viewer"];
}

export function getRolesDefinitonSecondary(): string[] {
    const roleDefiniton = getRolesDefinition();
    roleDefiniton.push("");
    return roleDefiniton;
}
