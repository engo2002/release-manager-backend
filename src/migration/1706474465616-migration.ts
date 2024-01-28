import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1706474465616 implements MigrationInterface {
    name = 'Migration1706474465616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release_field\` ADD \`releaseId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`release_field\` ADD \`releaseIdId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`release_field\` ADD CONSTRAINT \`FK_9df86d2c98356d15484407ff9eb\` FOREIGN KEY (\`releaseIdId\`) REFERENCES \`release\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`release_field\` DROP FOREIGN KEY \`FK_9df86d2c98356d15484407ff9eb\``);
        await queryRunner.query(`ALTER TABLE \`release_field\` DROP COLUMN \`releaseIdId\``);
        await queryRunner.query(`ALTER TABLE \`release_field\` DROP COLUMN \`releaseId\``);
    }

}
