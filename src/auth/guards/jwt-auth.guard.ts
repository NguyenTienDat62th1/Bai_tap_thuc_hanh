import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access
    if (isPublic) {
      return true;
    }

    // Otherwise, proceed with the default JWT authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token or session expired');
    }
    
    // Attach the user to the request object for use in route handlers
    const request = context.switchToHttp().getRequest();
    request.user = user;
    
    return user;
  }
}
