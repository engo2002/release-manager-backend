import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ description: "username or email" }) @IsNotEmpty() readonly username: string;
    @ApiProperty() @IsNotEmpty() readonly password: string;
    @ApiProperty({ required: false, default: false }) stayLoggedIn?: boolean;
    @ApiProperty({ required: false }) code?: string;
}
