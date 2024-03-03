import { ApiProperty } from "@nestjs/swagger";
import { TwoFactorUserDto } from "./twoFactorUser.dto";

export class TwoFactorCreateDto extends TwoFactorUserDto {
    @ApiProperty({ type: "string" })
    password: string;
}
