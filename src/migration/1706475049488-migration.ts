import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1706475049488 implements MigrationInterface {
    name = 'Migration1706475049488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release_field\` ADD \`fieldType\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release_field\` DROP COLUMN \`fieldType\``);
    }

}
