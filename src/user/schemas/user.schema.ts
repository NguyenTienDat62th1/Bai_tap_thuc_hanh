import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  })
  email: string;

  @Prop({ 
    type: String, 
    required: true,
    minlength: 6,
    select: false, // Không trả về password khi query
  })
  password: string;

  @Prop({ 
    type: String, 
    trim: true,
    maxlength: 50,
  })
  fullName: string;

  @Prop({ 
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({ 
    type: String,
    default: 'https://i.pravatar.cc/300',
  })
  avatar: string;

  @Prop({ 
    type: Boolean,
    default: false,
  })
  isEmailVerified: boolean;

  @Prop({ 
    type: String,
    select: false,
  })
  emailVerificationToken: string;

  @Prop({
    type: Date,
  })
  emailVerificationExpires: Date;

  @Prop({
    type: String,
    select: false,
  })
  resetPasswordToken: string;

  @Prop({
    type: Date,
  })
  resetPasswordExpire: Date;

  // Virtuals
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });

// Virtuals
UserSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});
