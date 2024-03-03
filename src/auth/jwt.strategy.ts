import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserDto } from "src/users/dto/user.dto";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
        });
    }

    async validate(payload: any): Promise<UserDto> {
        const user = await this.authService.validateUser(payload);
        if (!user) {
            throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}
