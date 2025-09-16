import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

class RedisConfigVariables {
  @IsString()
  @IsOptional()
  REDIS_HOST = 'localhost';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  REDIS_PORT = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  REDIS_DB = 0;

  @IsString()
  @IsOptional()
  REDIS_KEY_PREFIX = 'nest:';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  REDIS_TTL = 3600; // 1 hour in seconds

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  REDIS_TLS = false;
}

export const redisConfig = registerAs('redis', () => {
  const config = new RedisConfigVariables();

  // Load from environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key in config) {
      config[key] = value;
    }
  }

  return {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB,
    keyPrefix: config.REDIS_KEY_PREFIX,
    ttl: config.REDIS_TTL,
    tls: config.REDIS_TLS ? {} : undefined,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
  };
});

export type RedisConfig = ReturnType<typeof redisConfig>;
