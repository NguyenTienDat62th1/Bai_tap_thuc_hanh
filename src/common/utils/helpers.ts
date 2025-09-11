import * as bcrypt from 'bcryptjs';

export class CommonHelpers {
 
// Mã hóa mật khẩu sử dụng bcrypt
// @param password Mật khẩu cần mã hóa
// @returns Chuỗi đã được mã hóa
   
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

// So sánh mật khẩu với chuỗi đã mã hóa
// @param password Mật khẩu gốc
// @param hash Chuỗi đã mã hóa
// @returns boolean
  static async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }


// Tạo token ngẫu nhiên
// @param length Độ dài của token (mặc định: 32 ký tự)
// @returns Chuỗi token ngẫu nhiên
  static generateRandomToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  
// Kiểm tra email hợp lệ
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
