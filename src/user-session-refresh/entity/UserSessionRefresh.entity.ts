import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity("user_session_refresh")
export class UserSessionRefreshEntity {
    @ApiProperty()
    @Column({
        type: "varchar",
        name: "sessionId",
        nullable: false,
        unique: true,
        length: 255,
        primary: true,
        generated: "uuid",
    })
    sessionId: string;

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
        name: "refreshTokenHash",
        nullable: false,
        unique: true,
    })
    refreshTokenHash: string;

    @ApiProperty({ description: "timestamp" })
    @Column({
        type: "varchar",
        name: "expiresAt",
        nullable: false,
        unique: false,
    })
    expiresAt: string; // timestamp

    @ApiProperty()
    @Column({
        type: "boolean",
        name: "stayLoggedIn",
        nullable: false,
        unique: false,
        default: false,
    })
    stayLoggedIn: boolean;

    @ApiProperty({ required: false })
    @Column({
        type: "varchar",
        name: "os",
        nullable: true,
        unique: false,
    })
    os?: string;

    @ApiProperty({ required: false })
    @Column({
        type: "varchar",
        name: "agent",
        nullable: true,
        unique: false,
    })
    agent?: string;
}
