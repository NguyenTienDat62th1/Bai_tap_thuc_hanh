import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  }


// Gửi email đặt lại mật khẩu
// @param email Địa chỉ email người nhận
// @param token Token đặt lại mật khẩu
// @param resetUrl URL đặt lại mật khẩu

  async sendResetPasswordEmail(email: string, token: string, resetUrl: string) {
    try {
      await this.transporter.sendMail({
        from: 'noreply@example.com',
        to: email,
        subject: 'Đặt lại mật khẩu',
        html: `
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu.</p>
          <p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new Error('Có lỗi xảy ra khi gửi email đặt lại mật khẩu');
    }
  }

  // Có thể thêm các phương thức gửi email khác ở đây
}
