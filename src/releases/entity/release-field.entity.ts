import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {ApiProperty} from "@nestjs/swagger";
import {Project} from "../../projects/entity/project.entity";
import {Release} from "./release.entity";

@Entity()
export class ReleaseField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
    fieldType: string;

    @ApiProperty()
    @Column({ type: 'text' })
    content: string;

    @ApiProperty()
    @Column({ type: 'boolean', default: true })
    showInWhatsNew: boolean;

    @ApiProperty()
    @ManyToOne(() => Release, release => release.fields)
    @Column({ type: 'varchar', name: 'releaseId', nullable: false })
    releaseId: string;
}
