import { Controller, Delete, Get, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {ApiBearerAuth, ApiParam, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import { Permissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import { UserSessionRefreshService } from "./user-session-refresh.service";
import {UserSessionDto} from "./dto/UserSessionDto";

@Controller("sessions")
export class UserSessionRefreshController {
    constructor(private userSessionRefresh: UserSessionRefreshService) {}

    @Get("user/:userId/active")
    @ApiTags("Sessions")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("ownUser")
    @ApiBearerAuth("JWT-auth")
    @ApiParam({
        name: "userId",
        required: true,
        type: "string",
    })
    @ApiResponse({ type: UserSessionDto, isArray: true })
    async getActiveSessions(@Param() params) {
        return await this.userSessionRefresh.getActiveSessionsByUserId(params.userId);
    }

    @Get("user/:userId/activeCount")
    @ApiTags("Sessions")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("ownUser")
    @ApiBearerAuth("JWT-auth")
    @ApiParam({
        name: "userId",
        required: true,
        type: "string",
    })
    async getActiveSessionsCount(@Param() params) {
        return await this.userSessionRefresh.getActiveSessionsCountByUserId(params.userId);
    }

    @Delete("user/:userId/session/:sessionId")
    @ApiTags("Sessions")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("ownUser")
    @ApiBearerAuth("JWT-auth")
    @ApiParam({
        // userId required for ownUser Validation
        name: "userId",
        required: true,
        type: "string",
    })
    @ApiParam({
        name: "sessionId",
        required: true,
        type: "string",
    })
    async deleteSessionById(@Param() params) {
        return await this.userSessionRefresh.deleteSessionBySessionId(params.sessionId);
    }

    @Delete("user/:userId/all")
    @ApiTags("Sessions")
    @UseGuards(AuthGuard(), PermissionsGuard)
    @Permissions("ownUser")
    @ApiBearerAuth("JWT-auth")
    @ApiParam({
        name: "userId",
        required: true,
        type: "string",
    })
    @ApiQuery({
        name: "excludeId",
        required: false,
        type: "string",
    })
    async deleteAllSessions(@Param() params, @Query() query) {
        return await this.userSessionRefresh.deleteSessionsForUserId(params.userId, query.excludeId);
    }
}
