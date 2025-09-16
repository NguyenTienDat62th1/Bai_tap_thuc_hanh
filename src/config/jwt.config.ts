import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
  issuer?: string;
  audience?: string;
}

class JwtConfigVariables {
  @IsString()
  JWT_SECRET = 'your-secret-key';

  @IsString()
  JWT_REFRESH_SECRET = 'your-refresh-secret-key';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10) || 3600)
  JWT_ACCESS_EXPIRES_IN = 3600; // 1 hour

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10) || 2592000)
  JWT_REFRESH_EXPIRES_IN = 2592000; // 30 days

  @IsString()
  @IsOptional()
  JWT_ISSUER?: string;

  @IsString()
  @IsOptional()
  JWT_AUDIENCE?: string;
}

export const jwtConfig = registerAs('jwt', () => {
  const config = new JwtConfigVariables();

  // Load from environment variables
  return {
    secret: process.env.JWT_SECRET || config.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN
      ? parseInt(process.env.JWT_ACCESS_EXPIRES_IN, 10)
      : config.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      ? parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10)
      : config.JWT_REFRESH_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER || config.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE || config.JWT_AUDIENCE,
  };
});

// // Export the JwtConfig type for use in other files
// export { JwtConfig };
