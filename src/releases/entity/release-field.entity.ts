import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class ReleaseField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'boolean', default: true })
    showInWhatsNew: boolean;
}
