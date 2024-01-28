import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ReleaseField} from './release-field.entity';
import {ApiProperty} from '@nestjs/swagger';
import {Project} from 'src/projects/entity/project.entity';
import {IsString, Length} from "class-validator";

@Entity()
export class Release {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column({ type: 'varchar', nullable: false })
    @ApiProperty()
    releaseNumber: string;

    @ApiProperty({ type: () => Project })
    @ManyToOne(() => Project, project => project.releases)
    @Column({ type: 'varchar', name: 'projectId', nullable: false })
    projectId: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    @ApiProperty()
    @Length(1,200)
    headline: string;

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

    @OneToMany(() => ReleaseField, (releaseField) => releaseField.releaseId)
    @ApiProperty({ isArray: true, type: () => ReleaseField })
    fields: ReleaseField[];
}
