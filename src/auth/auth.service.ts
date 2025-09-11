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
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    
    if (!user) {
      // For security reasons, we don't want to reveal if the email exists or not
      return { message: 'If the email exists, a reset token will be sent' };
    }

    // Generate reset token (6 digits)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save reset token to user
    await this.userService.setPasswordResetToken(user._id, resetToken, resetTokenExpires);

    // Log token to console for testing
    console.log('=== RESET PASSWORD TOKEN ===');
    console.log(`Email: ${user.email}`);
    console.log(`Token: ${resetToken}`);
    console.log('===========================');

    // Send email with reset token
    try {
      const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${resetToken}`;
      
      await this.mailService.sendMail(
        user.email,
        'Your Password Reset Token',
        'reset-token',
        {
          name: user.firstName || user.email.split('@')[0],
          resetUrl,
          token: resetToken,
          expiresIn: '10 minutes',
          appName: this.configService.get('app.name', 'Our App'),
          supportEmail: this.configService.get('mail.supportEmail', 'support@example.com'),
        }
      );
      
      return { message: 'If the email exists, a reset token will be sent' };
    } catch (error) {
      console.error('Failed to send email:', error);
      // Still return success to user even if email fails (security)
      return { message: 'If the email exists, a reset token will be sent' };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Find user by reset token and check if it's not expired
    const user = await this.userService.findByResetToken(resetPasswordDto.token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if passwords match
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Update password
    await this.userService.updatePassword(user._id, resetPasswordDto.newPassword);
    
    // Clear reset token
    await this.userService.clearResetToken(user._id);
  }
}
