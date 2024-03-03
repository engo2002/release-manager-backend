import { ApiProperty } from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { IsHash } from "class-validator";
import { BeforeInsert, Column, Entity } from "typeorm";

@Entity("users")
export class UserEntity {
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
        nullable: false,
        length: 50,
        unique: true,
    })
    username: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: false,
        length: 255,
    })
    fullname: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: false,
        length: 1000,
    })
    password: string;

    @ApiProperty()
    @Column({
        type: "varchar",
        nullable: false,
        length: 255,
        unique: true,
    })
    email: string;

    @Column({
        nullable: true,
        unique: true,
    })
    @Exclude()
    @IsHash("bcrypt")
    public currentHashedRefreshToken?: string;

    @Column({ default: false })
    public isTwoFactorAuthenticationEnabled: boolean;

    @Column({
        type: "int",
        nullable: false,
        default: 0,
    })
    @ApiProperty()
    public failedLogins: number;

    @Column({
        type: "varchar",
        nullable: false,
        default: "0",
    })
    @ApiProperty()
    public lastFailedLogin: string;

    @Column({
        type: "varchar",
        nullable: false,
        default: "0",
    })
    @ApiProperty()
    public lastLogin: string;

    @Column({ nullable: true, unique: true })
    @Exclude()
    public twoFactorAuthenticationSecret?: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
