import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

class MailConfigVariables {
  @IsString()
  @IsOptional()
  MAIL_HOST = 'smtp.example.com';

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  MAIL_PORT = 587;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  MAIL_SECURE = false;

  @IsString()
  @IsOptional()
  MAIL_USER?: string;

  @IsString()
  @IsOptional()
  MAIL_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MAIL_FROM = 'noreply@example.com';

  @IsString()
  @IsOptional()
  MAIL_NAME = 'NestJS App';

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  MAIL_DEBUG = false;
}

export const mailConfig = registerAs('mail', () => {
  const config = new MailConfigVariables();

  // Load from environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key in config) {
      config[key] = value;
    }
  }

  return {
    transport: {
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: config.MAIL_SECURE,
      auth: config.MAIL_USER && config.MAIL_PASSWORD ? {
        user: config.MAIL_USER,
        pass: config.MAIL_PASSWORD,
      } : undefined,
      debug: config.MAIL_DEBUG,
      logger: config.MAIL_DEBUG,
    },
    defaults: {
      from: `"${config.MAIL_NAME}" <${config.MAIL_FROM}>`,
    },
    template: {
      dir: process.cwd() + '/templates/email',
      options: {
        strict: true,
      },
    },
  };
});

export type MailConfig = ReturnType<typeof mailConfig>;
