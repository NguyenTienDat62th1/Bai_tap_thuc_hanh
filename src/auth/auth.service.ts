import { 
  Injectable, 
  UnauthorizedException,
  ConflictException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtConfig } from '../config/jwt.config';
import { JwtPayload } from './interfaces';
import { TokenPair } from './interfaces/token-pair.interface';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from './enums/role.enum';
import { MailService } from '../shared/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user._id,
      email: user.email,
      roles: user.roles || [],
      type: 'access',
    };

    const tokens = await this.generateTokens(payload);
    
    // Update last login time
    await this.userService.updateLastLogin(user._id);
    
    return tokens;
  }

  async refreshToken(user: any): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles || [],
      type: 'access',
    };

    return this.generateTokens(payload);
  }

  private async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const jwtConfig = this.configService.get<JwtConfig>('jwt');

    if (!jwtConfig) {
      throw new Error('JWT configuration not found');
    }
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: jwtConfig.secret,
          expiresIn: jwtConfig.accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: jwtConfig.refreshSecret,
          expiresIn: jwtConfig.refreshExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessExpiresIn,
      tokenType: 'Bearer',
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    if (!registerDto.email || !registerDto.password) {
      throw new Error('Email and password are required');
    }

    // Check if user with email already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Map RegisterDto to User document
    const userData = {
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      roles: [Role.USER],
      isActive: true,
      isEmailVerified: false,
    };

    // Create user with required fields
    const user = await this.userService.create(userData);

    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { 
        sub: user._id, 
        email: user.email, 
        type: 'verification' 
      },
      { 
        secret: this.configService.get<string>('jwt.secret') || 'fallback_secret',
        expiresIn: '1d',
      },
    );

    // TODO: Send verification email
    // await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.userService.findByEmail(forgotPasswordDto.email);
      
      if (user) {
        // Generate reset token with user ID and expiration
        const resetToken = this.jwtService.sign(
          { 
            sub: user._id,
            email: user.email,
            type: 'reset',
            iat: Math.floor(Date.now() / 1000),
          },
          { 
            secret: this.configService.get<string>('JWT_RESETPASSWORD_KEY')||
            this.configService.get<string>('jwt.secret'),
            expiresIn: '15m', // Token expires in 15 minutes
          }
        );

        const frontendUrl = this.configService.get<string>('FRONTEND_URL');

        // Lưu thông tin reset token
        await this.userService.setResetToken(
          user._id,
          resetToken,
          new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        );
        // Send email with reset token
        try {
          await this.mailService.sendPasswordResetEmail(
            user.email,
            user.firstName || 'User',
            resetToken,
          );
        } catch (emailError) {
          console.error('Gửi email thất bại:', emailError);
          // Don't fail the request if email sending fails
        }
      }
      
      // Always return success to prevent email enumeration
      return { message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu' };
    } catch (error) {
      console.error('Error in forgot password:', error);
      throw new InternalServerErrorException('Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // 1. Kiểm tra mật khẩu mới và xác nhận mật khẩu khớp nhau
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    let payload;
    try {
      // 2. Xác minh và giải mã token với secret key riêng cho reset password
      payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get<string>('JWT_RESETPASSWORD_KEY') || this.configService.get<string>('jwt.secret')
      });
      
      // 3. Kiểm tra loại token
      if (payload.type !== 'reset') {
        throw new BadRequestException('Loại token không hợp lệ');
      }

      // 4. Kiểm tra thời gian hết hạn
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new BadRequestException('Token đã hết hạn');
      }

      // 5. Tìm người dùng từ token
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      // 6. Kiểm tra email trong token có khớp với email của người dùng không
      if (user.email !== payload.email) {
        throw new BadRequestException('Thông tin xác thực không hợp lệ');
      }

      // 7. Kiểm tra token đã được sử dụng chưa (nếu có lưu trong DB)
      if (user.resetPasswordToken && user.resetPasswordToken.used) {
        throw new BadRequestException('Token đã được sử dụng');
      }

      // 8. Cập nhật mật khẩu mới
      await this.userService.updatePassword(user._id, resetPasswordDto.newPassword);
      
      // 9. Đánh dấu token đã sử dụng (one-time use)
      await this.userService.markResetTokenAsUsed(user._id, resetPasswordDto.token);
      
    } catch (error) {
      // Xử lý các lỗi cụ thể
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn. Vui lòng yêu cầu gửi lại email đặt lại mật khẩu');
      } else if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Token không hợp lệ');
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      throw new BadRequestException('Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  }
}
