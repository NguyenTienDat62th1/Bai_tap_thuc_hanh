import { Role } from '../enums/role.enum';

export interface JwtPayload {
  /** Subject (user ID) */
  sub: string;
  
  /** User email */
  email: string;
  
  /** User roles */
  roles?: Role[];
  
  /** Token type (e.g., 'access' or 'refresh') */
  type?: string;
  
  /** Issued at */
  iat?: number;
  
  /** Expiration time */
  exp?: number;
}
