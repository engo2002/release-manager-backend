import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { Permissions } from "src/auth/permissions.decorator";
import { PermissionsGuard } from "src/auth/permissions.guard";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { rolesDto } from "./dto/rolesDto.dto";
import { RolesEntity } from "./entity/roles.entity";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
    constructor(private readonly service: RolesService) {}

    @Get("rolesdefinition")
    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiTags("UserRoles")
    getDefinition() {
        return this.service.getRolesDefinition();
    }

    @Get(":userId")
    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiTags("UserRoles")
    @ApiParam({ name: "userId", required: true, type: "string" })
    get(@Param() params) {
        return this.service.getUserRoles(params.userId);
    }

    @Get()
    @UseGuards(AuthGuard())
    @ApiBearerAuth("JWT-auth")
    @ApiTags("UserRoles")
    getAll() {
        return this.service.getAll();
    }

    @Post("create")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @ApiTags("UserRoles")
    create(@Body() rolesDto: rolesDto): Promise<RolesEntity> {
        return this.service.createUserRoles(rolesDto);
    }

    @Put("change/:userId")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("canWriteUsers")
    @ApiBearerAuth("JWT-auth")
    @ApiTags("UserRoles")
    @ApiParam({
        name: "userId",
        description: "userId",
        required: true,
        type: "string",
    })
    update(@Param() params, @Body() rolesDto: rolesDto) {
        return this.service.updateUserRoles(params.userId, rolesDto);
    }
}
