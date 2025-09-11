import { Inject, Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'nodemailer';
import * as path from 'path';
import {promises as fs} from 'fs';
import * as handlebars from 'handlebars';
import { promises } from 'fs';

interface MailOptions {
  to: string | string[];
  from: string;
  subject: string;
  //template: string;
  //context: Record<string, unknown>;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly defaultFrom: string;
  private readonly templateDir: string;

  constructor(
    @Inject(NestMailerService) private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {
    this.defaultFrom = this.configService.get<string>('mail.defaults.from', 'no-reply@example.com');
    this.templateDir = path.join(process.cwd(), 'src/shared/mail/templates');
  }

  private async compileTemplate(templateName: string, context: any): Promise<string> {
    try {
      const templatePath = path.join(this.templateDir, `${templateName}.hbs`);
      const templateSource = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(context);
    } catch (error) {
      this.logger.error(`Lỗi khi biên dịch template ${templateName}: ${error.message}`);
      throw error;
    }
  }

  async sendMail(
    to: string | string[],
    subject: string,
    template: string,
    context: Record<string, unknown> = {},
    from?: string,
  ): Promise<SentMessageInfo> {
    try {
      const html = await this.compileTemplate(template, context);
      const mailOptions: MailOptions = {
        to,
        from: from || this.defaultFrom,
        subject,
        //template: `./${template}`,
        html,
      };

      try {
        const text = await this.compileTemplate(`${template}.text`, context);
        mailOptions.text = text;
      } catch (error) {
        this.logger.warn(`Plain text template not found for ${template}, falling back to HTML only`);
      }

      const result = await this.mailerService.sendMail(mailOptions);
      this.logger.log(`Email sent to ${Array.isArray(to) ? to.join(', ') : to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const appName = this.configService.get<string>('app.name', 'Our App');
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    return this.sendMail(
      email,
      `Verify your email for ${appName}`,
      'verification',
      {
        name,
        verificationUrl,
        appName,
      },
    );
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<SentMessageInfo> {
    const appName = this.configService.get<string>('app.name', 'Our App');
    const frontendUrl = this.configService.get<string>('app.frontendUrl', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const supportEmail = this.configService.get('mail.supportEmail', 'support@example.com');

    return this.sendMail(
      email,
      `Reset Your Password - ${appName}`,
      'reset-token',
      {
        name,
        resetUrl,
        token,
        expiresIn: '10 minutes',
        appName,
        supportEmail
      },
      this.configService.get('mail.defaults.from', 'noreply@example.com')
    );
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
  ): Promise<SentMessageInfo> {
    const appName = this.configService.get<string>('app.name');
    const frontendUrl = this.configService.get<string>('app.frontendUrl');

    return this.sendMail(
      email,
      `Welcome to ${appName}!`,
      'welcome',
      {
        name,
        appName,
        frontendUrl,
      },
    );
  }

  async sendResetPasswordEmail(email: string, resetToken: string, resetUrl: string): Promise<SentMessageInfo> {
    return this.sendMail(
      email,
      'Đặt lại mật khẩu của bạn',
      'reset-password',
      {
        resetUrl,
        resetToken,
      },
    );
  }
}
