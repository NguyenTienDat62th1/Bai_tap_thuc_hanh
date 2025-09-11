export interface JwtPayload {
  sub: string;  // user ID
  username: string;
  // Add other JWT payload fields as needed
}

export interface UserProfile {
  userId: string;
  username: string;
  // Add other user profile fields as needed
}

export interface CreateUserDto {
  name: string;
  // Add other create user fields as needed
}
