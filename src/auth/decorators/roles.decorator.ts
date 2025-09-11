import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access a route
 * @param roles The roles that are allowed to access the route
 * @example @Roles(Role.ADMIN)
 * @example @Roles(Role.ADMIN, Role.MODERATOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
