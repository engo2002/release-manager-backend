import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1709480111758 implements MigrationInterface {
    name = 'Migration1709480111758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(255) NOT NULL, \`username\` varchar(50) NOT NULL, \`fullname\` varchar(255) NOT NULL, \`password\` varchar(1000) NOT NULL, \`email\` varchar(255) NOT NULL, \`currentHashedRefreshToken\` varchar(255) NULL, \`isTwoFactorAuthenticationEnabled\` tinyint NOT NULL DEFAULT 0, \`failedLogins\` int NOT NULL DEFAULT '0', \`lastFailedLogin\` varchar(255) NOT NULL DEFAULT '0', \`lastLogin\` varchar(255) NOT NULL DEFAULT '0', \`twoFactorAuthenticationSecret\` varchar(255) NULL, UNIQUE INDEX \`IDX_a3ffb1c0c8416b9fc6f907b743\` (\`id\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_f10e0127c051acd70e376ad1b2\` (\`currentHashedRefreshToken\`), UNIQUE INDEX \`IDX_94351fe0b282bca2b188ea06aa\` (\`twoFactorAuthenticationSecret\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token_blacklist\` (\`id\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`refreshToken\` varchar(255) NULL, \`expiresAt\` bigint NOT NULL, UNIQUE INDEX \`IDX_3e37528d03f0bd5335874afa48\` (\`id\`), UNIQUE INDEX \`IDX_80026c3cd27e041a0a1d91b5e0\` (\`refreshToken\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_session_refresh\` (\`sessionId\` varchar(255) NOT NULL, \`userId\` varchar(255) NOT NULL, \`refreshTokenHash\` varchar(255) NOT NULL, \`expiresAt\` varchar(255) NOT NULL, \`stayLoggedIn\` tinyint NOT NULL DEFAULT 0, \`os\` varchar(255) NULL, \`agent\` varchar(255) NULL, UNIQUE INDEX \`IDX_610d3d421b2fc7d118a67a001f\` (\`sessionId\`), UNIQUE INDEX \`IDX_3a06df225e47548f4fefe96b9b\` (\`refreshTokenHash\`), PRIMARY KEY (\`sessionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`userroles\` (\`id\` varchar(255) NOT NULL, \`primaryRole\` varchar(255) NOT NULL, \`secondaryRole\` varchar(255) NULL, \`user\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_0f5953feb835cabaab6de9f414\` (\`id\`), UNIQUE INDEX \`IDX_6c0058320f24958e99f668812a\` (\`user\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`
            INSERT INTO users (id, username, fullname, password, email)
            VALUES (UUID(), 'default', 'Standard Benutzer', '$2a$10$yNQEam.WKuwjw4qiWNMjaOJvMxSp144o6l2kEFyORjjcBHx0Ki1x.', 'example@example.com')
        `);

        await queryRunner.query(`
            INSERT INTO userroles (id, primaryRole, user)
            VALUES (UUID(), 'Admin', (SELECT id FROM users WHERE username = 'default'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_6c0058320f24958e99f668812a\` ON \`userroles\``);
        await queryRunner.query(`DROP INDEX \`IDX_0f5953feb835cabaab6de9f414\` ON \`userroles\``);
        await queryRunner.query(`DROP TABLE \`userroles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3a06df225e47548f4fefe96b9b\` ON \`user_session_refresh\``);
        await queryRunner.query(`DROP INDEX \`IDX_610d3d421b2fc7d118a67a001f\` ON \`user_session_refresh\``);
        await queryRunner.query(`DROP TABLE \`user_session_refresh\``);
        await queryRunner.query(`DROP INDEX \`IDX_80026c3cd27e041a0a1d91b5e0\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_3e37528d03f0bd5335874afa48\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP TABLE \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_94351fe0b282bca2b188ea06aa\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_f10e0127c051acd70e376ad1b2\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a3ffb1c0c8416b9fc6f907b743\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
