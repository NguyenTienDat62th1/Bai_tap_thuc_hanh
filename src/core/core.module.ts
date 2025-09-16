import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ConfigModule as AppConfigModule } from '../config/config.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute per IP
    }]),
    
    // Database
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost/nest',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    
    // Scheduled tasks
    ScheduleModule.forRoot(),
    
    // Application modules
    AppConfigModule,
    CommonModule,
    AuthModule,
    UserModule, // Add UserModule here
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CoreModule {}
