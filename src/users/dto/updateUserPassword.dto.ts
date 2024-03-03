import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class updateUserPasswordDto {
    @ApiProperty() @IsNotEmpty() username: string;
    @ApiProperty() @IsNotEmpty() oldPassword: string;
    @ApiProperty() @IsNotEmpty() newPassword: string;
    @ApiProperty() @IsNotEmpty() newPasswordCheck: string;
}
