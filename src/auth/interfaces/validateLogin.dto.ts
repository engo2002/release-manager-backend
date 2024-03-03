import { ApiProperty } from "@nestjs/swagger";

export class ValidateLoginDto {
    @ApiProperty()
    credentialsValid: boolean;
    @ApiProperty()
    twoFactorEnabled?: boolean;
}
