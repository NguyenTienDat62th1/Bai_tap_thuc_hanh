import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SharedModule } from './shared/shared.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    CoreModule,
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
      transport: {
        host: configService.get('mail.host'),
        port: configService.get('mail.port'),
        secure: false,
        auth: {
          user: configService.get('mail.user'),
          pass: configService.get('mail.password'),
        },
      },
      defaults: {
        from: `"${configService.get('mail.defaults.fromName', 'NestJS App')}" <${configService.get('mail.defaults.from', 'noreply@example.com')}>`,
      },
      template: {
        dir: join(__dirname, '../shared/mail/templates'),
        adapter: new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter').HandlebarsAdapter)(),
        options: {
          strict: true,
        },
      },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
