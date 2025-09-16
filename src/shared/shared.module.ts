import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from './cache/cache.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    MailModule,
  ],
  exports: [
    ConfigModule,
    CacheModule,
    MailModule,
  ],
})
export class SharedModule {}
