import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class updateUserPasswordAdminDto {
    @ApiProperty() @IsNotEmpty() username: string;
    @ApiProperty() @IsNotEmpty() newPassword: string;
    @ApiProperty() @IsNotEmpty() newPasswordCheck: string;
}
