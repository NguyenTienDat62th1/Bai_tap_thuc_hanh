import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoConfig } from './config/mongo.config';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [MongooseModule.forRoot(mongoConfig.uri), AuthModule, JwtModule.register({
    global: true,
    secret: 'secretKey',
    signOptions: { expiresIn: '1h' },
  })], 
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
