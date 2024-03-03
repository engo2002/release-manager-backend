import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsHash, IsNotEmpty } from "class-validator";

export class UserDto {
    @IsNotEmpty() id: string;
    @ApiProperty() @IsNotEmpty() username: string;
    @ApiProperty() @IsNotEmpty() fullname: string;
    @ApiProperty() @IsNotEmpty() @IsEmail() email: string;
    @ApiProperty() @IsHash("bcrypt") currentHashedRefreshToken?: string;
    @ApiProperty() isTwoFactorAuthenticationEnabled: boolean;
    @ApiProperty() lastLogin: string;
    @ApiProperty() failedLogins: number;
    @ApiProperty({ nullable: true }) avatar?: string;
}
