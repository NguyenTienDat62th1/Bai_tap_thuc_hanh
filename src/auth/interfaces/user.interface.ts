import { Document } from 'mongoose';
import { Role } from '../enums/role.enum';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  roles: Role[];
  lastLogin?: Date;
  passwordChangedAt?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createEmailVerificationToken(): string;
  createPasswordResetToken(): string;
}
