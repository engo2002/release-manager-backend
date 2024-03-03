import {Column, Entity} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("token_blacklist")
export class TokenBlacklistEntity {
    @ApiProperty()
    @Column({
        type: "varchar",
        name: "id",
        nullable: false,
        unique: true,
        length: 255,
        primary: true,
        generated: "uuid",
    })
    id: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        name: "userId",
        nullable: false,
        unique: false,
    })
    userId: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        name: "refreshToken",
        nullable: true,
        unique: true,
    })
    refreshToken: string;

    @ApiProperty({description: "timestamp"})
    @Column({
        type: "bigint",
        name: "expiresAt",
        nullable: false,
        unique: false,
    })
    expiresAt: number; // timestamp
}
