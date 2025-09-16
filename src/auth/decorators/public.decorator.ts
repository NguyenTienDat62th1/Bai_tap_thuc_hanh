import { SetMetadata } from '@nestjs/common';

/**
 * This constant is used to mark routes as public, meaning they don't require authentication.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route handler or controller as public.
 * When applied, the JwtAuthGuard will allow access to the route without a valid JWT token.
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('public-route')
 * publicRoute() {
 *   return 'This route is public';
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
