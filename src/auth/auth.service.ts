import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { User } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
      private readonly jwtService: JwtService,
      @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}
  
  // Hash password
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  // Register
  async register(body: any) {
    const { email, password } = body;

    // kiểm tra email tồn tại chưa
    const existingUser = await this.userModel.findOne({ username: email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = new this.userModel({
      username: email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      message: 'User registered successfully',
      user: { id: newUser._id, email: newUser.username },
    };
  }

  // Login
  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendResetPasswordMail(email: string, token: string) {
    if (!email) {
      return {
        message: 'Email is required',
      };
    }
    const transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });

    await transporter.sendMail({
      from: 'noreply@example.com',
      to: email,
      subject: 'Reset Password',
      text: `Click here to reset password: http://localhost:3000/reset?token=${token}`,
    });
  }
}
