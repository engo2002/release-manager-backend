import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorDto {
    @ApiProperty()
    secret: string;

    @ApiProperty()
    otpAuthUrl: string;
}
