import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';

export type UserDocument = HydratedDocument<User> & {
  _id: string;
  password: string;
  refreshToken?: string;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  resetPasswordToken?: ResetPasswordToken;
};
interface ResetPasswordToken {
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      // Create a new object with the properties we want to keep
      const { password, refreshToken, emailVerificationToken, passwordResetToken, resetToken, resetPasswordToken, __v, ...safeUser } = ret as unknown as UserDocument & { __v: number };
      return safeUser;
    },
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  collection: 'users',
})
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], enum: Role, default: [Role.USER] })
  roles: Role[];

  @Prop()
  lastLogin?: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop()
  refreshToken?: string;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  // @Prop()
  // resetPasswordToken: {
  //   token: string;
  //   expiresAt: Date;
  //   used: boolean;
  //   createdAt: Date;
  // };

  @Prop({
    type: {
      token: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
    _id: false,
  })
  resetPasswordToken?: ResetPasswordToken;
  // Virtual for fullName
  get fullName(): string {
    return `${this.firstName} ${this.lastName || ''}`.trim();
  }

  // Method to check if password was changed after a certain timestamp
  changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  // Method to check if the password reset token is expired
  isResetTokenExpired(): boolean {
    return !!(this.resetTokenExpires && new Date(this.resetTokenExpires) < new Date());
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
//UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ resetToken: 1 });
UserSchema.index({ resetTokenExpires: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiry
UserSchema.index(
  { 'resetPasswordToken.expiresAt': 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { 
    'resetPasswordToken.used': false,
    'resetPasswordToken.expiresAt': { $exists: true }
  } }
);
UserSchema.index(
  { 'resetPasswordToken.token': 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      'resetPasswordToken.token': { $exists: true },
      'resetPasswordToken.used': false
    },
    sparse: true
  }
);
export const USER_MODEL = 'User';
