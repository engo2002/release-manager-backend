import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { getRolesDefinition, getRolesDefinitonSecondary, rolesDefinition } from "../interface/roles.definition";

export class createRolesDto {
    @ApiProperty({
        enum: getRolesDefinition(),
    })
    @IsEnum({ type: getRolesDefinition() })
    primaryRole: rolesDefinition;
    @ApiProperty({
        enum: getRolesDefinitonSecondary(),
    })
    @IsEnum({ type: getRolesDefinition() })
    secondaryRole: rolesDefinition;
    @ApiProperty()
    user: string;
}
