import { ApiProperty } from "@nestjs/swagger";

export class GeneralUserDataDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    primaryRole: string;

    @ApiProperty()
    secondaryRole: string;

    @ApiProperty()
    lastLogin: string;
}
