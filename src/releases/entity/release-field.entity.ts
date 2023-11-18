import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Release } from './release.entity';

@Entity()
export class ReleaseField {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'boolean', default: true })
    showInWhatsNew: boolean;
}
