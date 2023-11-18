import * as dotenv from "dotenv";
import { DataSourceOptions } from "typeorm";

dotenv.config({
    path: !!process.env.NODE_ENV ? "local.env" : __dirname + "/.env",
});

export function getConfig() {
    return {
        name: "default",
        type: "mysql",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [process.env.DEFAULT_ENTITY],
        synchronize: false,
        ssl: {
            rejectUnauthorized: false,
        },
        migrations: [__dirname + "/migration/*.js"],
        migrationsRun: true,
    } as DataSourceOptions;
}
