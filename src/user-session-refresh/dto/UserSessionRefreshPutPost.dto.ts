import { ApiProperty } from "@nestjs/swagger";

export class UserSessionRefreshPutPostDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    expiresAt: string;

    @ApiProperty()
    stayLoggedIn: boolean;

    @ApiProperty({ required: false })
    os?: string;

    @ApiProperty({ required: false })
    agent?: string;
}
