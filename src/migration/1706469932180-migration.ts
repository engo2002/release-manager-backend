import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1706469932180 implements MigrationInterface {
    name = 'Migration1706469932180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release\` ADD \`headline\` varchar(200) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release\` DROP COLUMN \`headline\``);
    }

}
