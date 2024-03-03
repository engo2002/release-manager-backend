import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorUserDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    email: string;
}
