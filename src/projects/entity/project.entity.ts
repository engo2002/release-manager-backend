import { ApiProperty } from "@nestjs/swagger";
import { Release } from "src/releases/entity/release.entity";
import {Column, Entity, OneToMany} from "typeorm";

@Entity()
export class Project {
    @ApiProperty()
    @Column({
        name: "id",
        type: "varchar",
        primary: true,
        generated: "uuid",
    })
    id: string;

    @Column()
    @ApiProperty()
    name: string;

    @Column({ nullable: true })
    @ApiProperty()
    description: string;

    @Column({ nullable: true })
    @ApiProperty()
    link: string;

    @OneToMany(() => Release, release => release.project)
    @ApiProperty({ isArray: true, type: () => Release })
    releases: Release[];

}
