import { AppConfig } from './app.config';
import { DatabaseConfig } from './database.config';
import { JwtConfig } from './jwt.config';
import { MailConfig } from './mail.config';
import { RedisConfig } from './redis.config';

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  mail: MailConfig;
  redis: RedisConfig;
}

export type ConfigKey = keyof Config;

export type Environment = 'development' | 'production' | 'test';

export interface ConfigModuleOptions {
  isGlobal?: boolean;
  load?: Array<() => Record<string, any>>;
  envFilePath?: string | string[];
  ignoreEnvFile?: boolean;
  ignoreEnvVars?: boolean;
  validationSchema?: any;
  validationOptions?: {
    allowUnknown: boolean;
    abortEarly: boolean;
  };
  expandVariables?: boolean;
}
