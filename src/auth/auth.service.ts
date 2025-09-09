import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CommonHelpers } from 'src/common/helpers';
import { MailService } from 'src/common/services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  
  // Hash password
  // async hashPassword(password: string) {
  //   return await bcrypt.hash(password, 10);
  // }

  // async validatePassword(password: string, hash: string) {
  //   return await bcrypt.compare(password, hash);
  // }

  // Đăng ký người dùng mới
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Kiểm tra email tồn tại chưa
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email đã được đăng ký');
    }

    const hashedPassword = await CommonHelpers.hashPassword(password);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      message: 'Đăng ký thành công',
      user: { id: newUser._id, email: newUser.email },
    };
  }

  // Đăng nhập
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Thông tin đăng nhập không chính xác');
    }

    const isPasswordValid = await CommonHelpers.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Thông tin đăng nhập không chính xác');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Quên mật khẩu
  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Vui lòng nhập email');
    }

    if (!CommonHelpers.isValidEmail(email)) {
      throw new BadRequestException('Email không hợp lệ');
    }

    // Kiểm tra email có tồn tại không
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Không thông báo lỗi để tránh bị lộ thông tin
      return { message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu' };
    }

    // Tạo token reset password
    const resetToken = CommonHelpers.generateRandomToken(32);
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    // Lưu token vào database
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ
    await user.save();

    // Gửi email reset password
    await this.mailService.sendResetPasswordEmail(email, resetToken, resetUrl);

    return {
      message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu',
    };
  }
}
