import {ApiProperty} from "@nestjs/swagger";

export class UpdateProjectDto {
    @ApiProperty({ required: false })
    name?: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    link?: string;
}
