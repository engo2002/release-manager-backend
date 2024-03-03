import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ExtractJwt } from "passport-jwt";

export class GetTokenGuard implements CanActivate {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(context.switchToHttp().getRequest());
        await this.cacheManager.set("bearer", token);
        return true;
    }
}
