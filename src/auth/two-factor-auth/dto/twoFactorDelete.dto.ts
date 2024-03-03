import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorDeleteDto {
    @ApiProperty()
    userId: string;

    @ApiProperty({ type: "string" })
    password: string;
}
