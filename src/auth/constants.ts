// JWT Strategy Constants
export const JWT_STRATEGY_NAME = 'jwt';
export const JWT_REFRESH_STRATEGY_NAME = 'jwt-refresh';

// Local Strategy Constants
export const LOCAL_STRATEGY_NAME = 'local';

// Auth Constants
export const AUTH_HEADER_KEY = 'authorization';
export const AUTH_HEADER_PREFIX = 'Bearer ';

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password_reset',
} as const;

// Token Expiration Times (in seconds)
export const TOKEN_EXPIRATIONS = {
  ACCESS: 3600, // 1 hour
  REFRESH: 2592000, // 30 days
  VERIFICATION: 86400, // 24 hours
  PASSWORD_RESET: 3600, // 1 hour
} as const;

// Auth Error Messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden resource',
  ACCOUNT_LOCKED: 'Account is locked',
  EMAIL_VERIFICATION_REQUIRED: 'Email verification required',
  PASSWORD_RESET_EXPIRED: 'Password reset link has expired',
} as const;
