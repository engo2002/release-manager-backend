import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import * as fs from "fs";
import { access, mkdir, writeFile } from "fs/promises";
import Helmet from "helmet";
import * as http from "http";
import * as _ from "lodash";
import { createDatabase } from "typeorm-extension";
import { AppModule } from "./app.module";
import { getConfig } from "./data-source";
import { HttpExceptionFilter } from "./shared/http-exception/http-exception.filter";
import { QueryErrorFilter } from "./shared/query-error.filter";
import { version } from "./version.const";
import {BASE_PATH} from "./basePath.const";

async function bootstrap() {
    console.log(`releaseManager - Backend - V${version}`);

    await createDatabase({ ifNotExist: true, options: getConfig() });

    await checkAndCreateDirectory(`${BASE_PATH}/sec`);
    const accessTokenSecretPath = `${BASE_PATH}/sec/access.txt`;
    const refreshTokenSecretPath = `${BASE_PATH}/sec/refresh.txt`;

    await checkAndGenerateSecret(accessTokenSecretPath, "access", BASE_PATH);
    await checkAndGenerateSecret(refreshTokenSecretPath, "refresh", BASE_PATH);

    const allowCrossDomain = function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        next();
    };

    const options = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    };

    const server = express();
    server.use(Helmet());
    server.use(allowCrossDomain);

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        cors: options,
    });

    app.setGlobalPrefix("/api");

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new QueryErrorFilter(httpAdapter), new HttpExceptionFilter());

    process.env.TZ = "Europe/Berlin";

    const swaggerOptions = new DocumentBuilder()
        .setTitle("releaseManager")
        .setVersion(version)
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                name: "JWT",
                description: "Enter JWT token",
                in: "header",
            },
            "JWT-auth" // This name here is important for matching up with @ApiBearerAuth() in your controller!
        )
        .build();

    const document = SwaggerModule.createDocument(app, swaggerOptions);
    SwaggerModule.setup("api", app, document);

    if (_.isEmpty(process.env.HTTPPORT)) {
        process.env.HTTPPORT = "80";
    }

    http.createServer(server).listen(process.env.HTTPPORT);

    await app.init();
}

async function checkAndCreateDirectory(directoryPath: string) {
    try {
        await access(directoryPath);
        console.log(`Directory ${directoryPath} already exists.`);
    } catch (error) {
        try {
            await mkdir(directoryPath, { recursive: true });
            console.log(`Created directory ${directoryPath}.`);
        } catch (error) {
            console.error(`Error creating directory ${directoryPath}:`, error);
            process.exit(1);
        }
    }
}

async function checkAndGenerateSecret(secretPath: string, secretType: string, BASE_PATH: string) {
    try {
        await access(secretPath);
        console.log(`${secretType} secret already exists. Skipping generation.`);

        const secret = await readSecretFromFile(secretPath);
        setEnvVariable(secretType, secret);
    } catch (error) {
        console.log(`${secretType} secret does not exist. Generating a new secret.`);

        try {
            await createSecretsDirectory(BASE_PATH);
            const newSecret = generateJwtSecret(128);
            await saveSecretToFile(secretPath, newSecret);
            console.log(`${secretType} secret generated and saved to ${secretType}.txt.`);
            setEnvVariable(secretType, newSecret);
        } catch (error) {
            console.error(`Error generating ${secretType} secret:`, error);
            process.exit(1);
        }
    }
}

async function createSecretsDirectory(BASE_PATH: string) {
    try {
        await access(`${BASE_PATH}/sec`);
    } catch (error) {
        try {
            await mkdir(`${BASE_PATH}/sec`);
            console.log("Created directory for JWT secrets.");
        } catch (error) {
            console.error("Error creating directory for JWT secrets:", error);
            process.exit(1);
        }
    }
}

async function saveSecretToFile(filePath: string, secret: string) {
    try {
        await writeFile(filePath, secret);
    } catch (error) {
        console.error("Error writing secret to file:", error);
        process.exit(1);
    }
}

async function readSecretFromFile(filePath: string): Promise<string | null> {
    try {
        const secret = fs.readFileSync(filePath, "utf8");
        return secret.trim();
    } catch (error) {
        console.error(`Error reading secret from file ${filePath}: ${error.message}`);
        return null;
    }
}

function generateJwtSecret(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

    let secret = "";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        secret += characters.charAt(randomIndex);
    }

    return secret;
}

function setEnvVariable(secretType: string, secret: string) {
    if (secretType === "access") {
        process.env.JWT_ACCESS_TOKEN_SECRET = secret;
    } else if (secretType === "refresh") {
        process.env.JWT_REFRESH_TOKEN_SECRET = secret;
    }
}

bootstrap().catch((error) => {
    console.error("Error during bootstrap:", error);
    process.exit(1);
});
