import {MigrationInterface, QueryRunner} from "typeorm";

export class Migration1705447295438 implements MigrationInterface {
    name = 'Migration1705447295438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`release_field\` (\`id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`showInWhatsNew\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`release\` (\`id\` varchar(36) NOT NULL, \`releaseNumber\` varchar(255) NOT NULL, \`image\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`project\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`link\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`project\``);
        await queryRunner.query(`DROP TABLE \`release\``);
        await queryRunner.query(`DROP TABLE \`release_field\``);
    }

}
