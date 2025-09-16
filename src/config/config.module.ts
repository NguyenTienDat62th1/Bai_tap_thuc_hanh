import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { mailConfig } from './mail.config';
import { redisConfig } from './redis.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, redisConfig],
      expandVariables: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
