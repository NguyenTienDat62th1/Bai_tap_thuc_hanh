import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

class DatabaseConfigVariables {
  @IsString()
  @IsOptional()
  MONGODB_URI?: string;

  @IsString()
  @IsOptional()
  MONGODB_DATABASE = 'nest';

  @IsString()
  @IsOptional()
  MONGODB_USERNAME?: string;

  @IsString()
  @IsOptional()
  MONGODB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MONGODB_HOST = 'localhost';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  MONGODB_PORT = 27017;
}

export const databaseConfig = registerAs('database', () => {
  const config = new DatabaseConfigVariables();

  // Load from environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key in config) {
      config[key] = value;
    }
  }

  // If MONGODB_URI is provided, use it directly
  if (config.MONGODB_URI) {
    return {
      uri: config.MONGODB_URI,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }

  // Otherwise construct the connection string
  const credentials = config.MONGODB_USERNAME && config.MONGODB_PASSWORD
    ? `${encodeURIComponent(config.MONGODB_USERNAME)}:${encodeURIComponent(config.MONGODB_PASSWORD)}@`
    : '';

  const uri = `mongodb://${credentials}${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.MONGODB_DATABASE}`;

  return {
    uri,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryAttempts: 3,
    retryDelay: 1000,
    autoIndex: process.env.NODE_ENV !== 'production',
    autoCreate: true,
  };
});

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
