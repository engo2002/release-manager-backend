import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import { getRolesDefinition, getRolesDefinitonSecondary, rolesDefinition } from "../../roles/interface/roles.definition";

export class CreateUserDto {
    @ApiProperty() @IsNotEmpty() username: string;
    @ApiProperty() @IsNotEmpty() fullname: string;
    @ApiProperty() @IsNotEmpty() password: string;
    @ApiProperty() @IsNotEmpty() @IsEmail() email: string;
    @ApiProperty({
        enum: getRolesDefinition(),
    })
    @IsNotEmpty()
    primaryRole: rolesDefinition;
    @ApiProperty({
        enum: getRolesDefinitonSecondary(),
    })
    secondaryRole: rolesDefinition;
}
