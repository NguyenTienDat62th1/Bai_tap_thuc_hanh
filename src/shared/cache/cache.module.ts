import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { redisConfig } from '../../config/redis.config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'memory', // or 'redis' if you're using Redis
        ttl: configService.get<number>('redis.ttl') || 3600, // 1 hour default
        max: 1000, // maximum number of items in cache
        isGlobal: true,
        ...(process.env.REDIS_ENABLED === 'true' ? redisConfig() : {}), // Only include Redis config if enabled
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
