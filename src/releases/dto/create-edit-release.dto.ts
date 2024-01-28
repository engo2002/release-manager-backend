import {ApiProperty} from "@nestjs/swagger";
import {ReleaseFieldDto} from "./release-field.dto";

export class CreateEditReleaseDto {
    @ApiProperty()
    releaseNumber: string;

    @ApiProperty({ maxLength: 200 })
    headline: string;

    @ApiProperty({ type: ReleaseFieldDto })
    majorField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    minorField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    bugfixField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    otherField: Partial<ReleaseFieldDto>;
}
