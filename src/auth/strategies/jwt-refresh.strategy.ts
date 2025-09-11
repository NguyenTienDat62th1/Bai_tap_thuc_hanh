import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const JWT_REFRESH_STRATEGY_NAME = 'jwt-refresh';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JWT_REFRESH_STRATEGY_NAME,
) {
  constructor(private readonly configService: ConfigService) {
    const jwtConfig = configService.get<JwtConfig>('jwt');
    
    if (!jwtConfig) {
      throw new Error('JWT configuration not found');
    }
    
    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: false, // Set to false to match StrategyOptionsWithoutRequest
    };

    // Add optional fields if they exist
    if (jwtConfig.issuer) {
      strategyOptions.issuer = jwtConfig.issuer;
    }
    if (jwtConfig.audience) {
      strategyOptions.audience = jwtConfig.audience;
    }
    
    super(strategyOptions);
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify this is a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    
    return { 
      userId: payload.sub, 
      email: payload.email,
      roles: payload.roles || []
    };
  }
}
