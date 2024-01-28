import {ApiProperty} from "@nestjs/swagger";
import {Release} from "../entity/release.entity";

export class ReleaseFieldDto {
    @ApiProperty()
    content: string;

    @ApiProperty()
    showInWhatsNew: boolean;
}
