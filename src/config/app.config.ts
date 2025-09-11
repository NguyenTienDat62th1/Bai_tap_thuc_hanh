import { registerAs } from '@nestjs/config';
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class AppConfigVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  PORT = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  @IsString()
  @IsUrl({ require_tld: false })
  FRONTEND_URL = 'http://localhost:3000';

  @IsString()
  APP_NAME = 'NestJS App';

  @IsString()
  APP_VERSION = '1.0.0';
}

export const appConfig = registerAs('app', () => {
  const config = new AppConfigVariables();
  
  // Validate configuration
  const errors = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key in config) {
      config[key] = value;
    }
  }

  return {
    env: config.NODE_ENV,
    port: config.PORT,
    apiPrefix: config.API_PREFIX,
    frontendUrl: config.FRONTEND_URL,
    name: config.APP_NAME,
    version: config.APP_VERSION,
    isDevelopment: config.NODE_ENV === Environment.Development,
    isProduction: config.NODE_ENV === Environment.Production,
    isTest: config.NODE_ENV === Environment.Test,
  };
});

export type AppConfig = ReturnType<typeof appConfig>;