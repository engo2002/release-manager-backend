import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    project: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    link?: string;
}
