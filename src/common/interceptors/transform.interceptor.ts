import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T = any> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;
    const timestamp = new Date().toISOString();
    const path = request.url;

    return next.handle().pipe(
      map((data: any) => ({
        statusCode,
        message: data?.message || 'Success',
        data: this.sanitizeData(data?.data ?? data),
        timestamp,
        path,
      })),
    );
  }

  private sanitizeData<T>(data: T): T | null {
    if (data === null || data === undefined) {
      return null;
    }

    // If data has a toObject method (like Mongoose documents), call it
    if (data && typeof data === 'object' && 'toObject' in data && typeof data.toObject === 'function') {
      return data.toObject({ virtuals: true });
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item)) as unknown as T;
    }

    // Handle nested objects
    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = this.sanitizeData(data[key]);
        }
      }
      return result as T;
    }

    return data;
  }
}
