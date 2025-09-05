import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { User } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // kiểm tra email tồn tại chưa
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      message: 'User registered successfully',
      user: { id: newUser._id, email: newUser.email },
    };
  }

  // Login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Forgot password
  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Kiểm tra email có tồn tại không
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    // Tạo token reset password
    const resetToken = Math.random().toString(36).substring(2);
    
    // Gửi email reset password
    await this.sendResetPasswordMail(email, resetToken);

    return {
      message: 'Reset password email sent successfully',
      token: resetToken, // Chỉ để debug, có thể bỏ sau này
    };
  }

  // Gửi email reset password
  async sendResetPasswordMail(email: string, token: string) {
    // Thực hiện gửi email ở đây
    // Đây là ví dụ đơn giản, bạn cần cấu hình nodemailer để gửi email thật
    console.log(`Sending reset password email to ${email} with token: ${token}`);
    
    // TODO: Implement actual email sending logic
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});
  }

  async sendResetPasswordMailOld(email: string, token: string) {
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
