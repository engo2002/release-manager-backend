import {ApiProperty} from "@nestjs/swagger";

export class ReleaseFieldDto {
    @ApiProperty()
    content: string;

    @ApiProperty()
    showInWhatsNew: boolean;
}
