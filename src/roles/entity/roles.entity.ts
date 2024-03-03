import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";
import { rolesDefinition } from "../interface/roles.definition";

@Entity("userroles")
export class RolesEntity {
    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: false,
        unique: true,
        length: 255,
        generated: "uuid",
        primary: true,
    })
    id: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: false,
        length: 255,
    })
    primaryRole: rolesDefinition;

    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: true,
        length: 255,
    })
    secondaryRole: rolesDefinition;

    @Column({
        type: "varchar",
        nullable: false,
        unique: true,
        length: 255,
    })
    user: string;
}
