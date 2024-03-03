import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { PermissionsService } from "./permissions.service";

@Controller("permissions")
export class PermissionsController {
    constructor(private permissionService: PermissionsService) {}

    @Get("/:userId")
    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiTags("Permissions")
    @ApiParam({ name: "userId", required: true, type: "string" })
    getUserPermissions(@Param() params) {
        return this.permissionService.getUserPermissions(params.userId);
    }
}
