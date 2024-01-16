import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ProjectsModule} from './projects/projects.module';
import {ReleasesModule} from './releases/releases.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ThrottlerModule} from "@nestjs/throttler";
import {ConfigModule} from "@nestjs/config";

const ENV = process.env.NODE_ENV;
@Module({
  imports: [ProjectsModule, ReleasesModule, ThrottlerModule.forRoot({
      throttlers: [{ limit: 500, ttl: 1 }]
  }),
      ConfigModule.forRoot({
          isGlobal: true,
          cache: false,
          envFilePath: !!ENV ? `${process.cwd()}/local.env` : `${process.cwd()}/.env`,
      }),
      TypeOrmModule.forRoot({
          name: "default",
          type: "mysql",
          port: 3306,
          host: process.env.DB_HOST,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          synchronize: false,
          entities: [process.env.DEFAULT_ENTITY],
          migrations: ["dist/migration/**/*.ts"],
          bigNumberStrings: false,
          migrationsRun: true,
          ssl: {
              rejectUnauthorized: false,
          },
      }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
