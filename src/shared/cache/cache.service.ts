import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 3600; // 1 hour in seconds

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cache.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`, error.stack);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      await this.cache.set(key, value, ttl || this.defaultTtl);
      return true;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.cache.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`, error.stack);
      return false;
    }
  }

  async reset(): Promise<boolean> {
    try {
      await this.cache.reset();
      return true;
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`, error.stack);
      return false;
    }
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      return await this.cache.wrap<T>(
        key,
        async () => await fn(),
        { ttl: (ttl || this.defaultTtl) * 1000 },
      );
    } catch (error) {
      this.logger.error(
        `Error in cache wrap for key ${key}: ${error.message}`,
        error.stack,
      );
      // If cache fails, just execute the function directly
      return fn();
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }
}
