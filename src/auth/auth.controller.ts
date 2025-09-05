import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User logged in successfully' })
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    if (!body.email) {
      return {
        message: 'Email is required',
      };
    }
    // Tạo token reset password (ở đây demo đơn giản, bạn có thể generate JWT hoặc random string)
    const resetToken = Math.random().toString(36).substring(2);

    await this.authService.sendResetPasswordMail(body.email, resetToken);

    return {
      message: 'Reset password email sent successfully',
      token: resetToken, // chỉ để debug xem token sinh ra, sau này có thể bỏ
    };
  }
}
