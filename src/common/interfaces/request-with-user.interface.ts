import { Request } from 'express';
import { User } from '../../user/schemas/user.schema';

/**
 * Interface extending Express Request to include the authenticated user
 */
export interface RequestWithUser extends Request {
  /**
   * The authenticated user object
   */
  user: User;
}
