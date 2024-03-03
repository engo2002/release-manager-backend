import { ApiProperty } from "@nestjs/swagger";

export class UserSessionDto {
    @ApiProperty()
    sessionId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    expiresAt: string;

    @ApiProperty()
    stayLoggedIn: boolean;

    @ApiProperty({ required: false })
    os?: string;

    @ApiProperty({ required: false })
    agent?: string;
}
