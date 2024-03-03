import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorLoginDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    authToken: string;
}
