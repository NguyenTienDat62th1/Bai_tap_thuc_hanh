import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from '../../user/user.service';

export const JWT_STRATEGY_NAME = 'jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const jwtConfig = configService.get<JwtConfig>('jwt');
    
    if (!jwtConfig) {
      throw new Error('JWT configuration not found');
    }

    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
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
      throw new UnauthorizedException('Invalid token');
    }

    // For access tokens, we don't need to check the token type
    // as this strategy is specifically for access tokens
    
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
  }
}
