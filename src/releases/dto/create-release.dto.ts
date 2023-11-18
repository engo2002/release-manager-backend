import { ApiProperty } from "@nestjs/swagger";
import { ReleaseFieldDto } from "./release-field.dto";

export class CreateReleaseDto {
    @ApiProperty()
    releaseNumber: string;

    @ApiProperty({ type: ReleaseFieldDto })
    majorField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    minorField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    bugfixField: Partial<ReleaseFieldDto>;

    @ApiProperty({ type: ReleaseFieldDto })
    otherField: Partial<ReleaseFieldDto>;
}
