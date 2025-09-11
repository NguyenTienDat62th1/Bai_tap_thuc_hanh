import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  // Regular user with basic permissions
  USER = 'user',
  
  // Admin with full access
  ADMIN = 'admin',
  
  // Can manage users but not system settings
  MODERATOR = 'moderator',
  // Add other roles as needed
}

// Register the enum with GraphQL if you're using it
registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});
