import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY_NAME } from '../strategies/jwt-refresh.strategy';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY_NAME) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new Error('Invalid or expired refresh token');
    }
    return user;
  }
}
