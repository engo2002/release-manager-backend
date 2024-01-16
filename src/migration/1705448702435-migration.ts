import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1705448702435 implements MigrationInterface {
    name = 'Migration1705448702435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release\` ADD \`projectId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`release\` ADD \`projectIdId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`release\` ADD CONSTRAINT \`FK_1d6149aa6f10ba8bcded5f7680e\` FOREIGN KEY (\`projectIdId\`) REFERENCES \`project\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release\` DROP FOREIGN KEY \`FK_1d6149aa6f10ba8bcded5f7680e\``);
        await queryRunner.query(`ALTER TABLE \`release\` DROP COLUMN \`projectIdId\``);
        await queryRunner.query(`ALTER TABLE \`release\` DROP COLUMN \`projectId\``);
    }

}
