import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { ReleaseField } from './release-field.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from 'src/projects/entity/project.entity';

@Entity()
export class Release {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column({ type: 'varchar', nullable: false })
    @ApiProperty()
    releaseNumber: string;

    @ApiProperty({ type: () => Project })
    @OneToOne(() => Project, project => project.releases)
    project: Project;

    @OneToOne(() => ReleaseField, { cascade: true })
    @ApiProperty()
    majorField: ReleaseField;

    @OneToOne(() => ReleaseField, { cascade: true })
    @ApiProperty()
    minorField: ReleaseField;

    @OneToOne(() => ReleaseField, { cascade: true })
    @ApiProperty()
    bugfixField: ReleaseField;

    @OneToOne(() => ReleaseField, { cascade: true })
    @ApiProperty()
    otherField: ReleaseField;

    @Column({ type: 'varchar', nullable: true })
    @ApiProperty()
    image: string; // Or any other suitable data type for image storage
}
