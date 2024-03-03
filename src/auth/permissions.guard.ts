import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { jwtDecode } from "jwt-decode";
import * as _ from "lodash";
import { ExtractJwt } from "passport-jwt";
import { PermissionsService } from "src/permissions/permissions.service";
import { AuthService } from "./auth.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector, private authService: AuthService, private permissionsService: PermissionsService) {}

    async canActivate(context: ExecutionContext) {
        const permissions = this.reflector.get<string[]>("permissions", context.getHandler());
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(context.switchToHttp().getRequest());
        if (!_.isEmpty(token)) {
            let decode: any;
            try {
                // eslint-disable-next-line prefer-const
                decode = jwtDecode(token);
            } catch (e) {
                throw new HttpException("invalid Token provided", HttpStatus.FORBIDDEN);
            }
            const username = decode.username;
            const userData = await this.authService.getUserDataByUsername(username);
            const userId = userData.id;
            const userPermissions = await this.permissionsService.getUserPermissions(userId);
            if (permissions.find((p) => userPermissions[p] === true)) {
                return true;
            } else {
                if (permissions.find((p) => p === "ownUser")) {
                    const request = context.switchToHttp().getRequest();
                    return request.params.id === request.user.id || request.params.userId === request.user.id;
                } else {
                    throw new HttpException("no permission to execute this task", HttpStatus.FORBIDDEN);
                }
            }
        }
    }
}
