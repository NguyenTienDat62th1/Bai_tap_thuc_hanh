import { IsNotEmpty, MinLength, MaxLength, Matches, IsString, ValidateIf } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token phải là chuỗi' })
  @IsNotEmpty({ message: 'Token không được để trống' })
  token: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  newPassword: string;

  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng xác nhận mật khẩu' })
  confirmPassword: string;
}
