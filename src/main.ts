import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {HttpException, HttpStatus, ValidationPipe} from "@nestjs/common";
import {ExpressAdapter} from "@nestjs/platform-express";
import * as bodyParser from "body-parser";
import Helmet from "helmet";
import { createDatabase } from "typeorm-extension";
import { getConfig } from './data-source';
import * as express from 'express';

(async () => {
  await createDatabase({ ifNotExist: true, options: getConfig() });
})();
async function bootstrap() {


  const config = new DocumentBuilder()
      .setTitle('Release Manager')
      .setVersion('1.0')
      .build();
  const allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, X-Auth-Token, Authorization, Accept,charset,boundary,Content-Length");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
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
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), { cors: options });

  app.setGlobalPrefix("/api");
  app.use(Helmet());
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(
      bodyParser.urlencoded({
        limit: "5mb",
        extended: true,
      })
  );
  app.use(allowCrossDomain);
  app.useGlobalPipes(
      new ValidationPipe({
        forbidUnknownValues: false,
        exceptionFactory: (errors) => {
          const result = errors.map((error) => ({
            property: error.property,
            message: error.children.map((c) => Object.values(c.constraints)).join(","),
          }));
          throw new HttpException(result.map((r) => r.message).join(","), HttpStatus.BAD_REQUEST);
        },
      })
  );
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
