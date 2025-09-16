import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
    required: false,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: 'your-secure-password',
    description: 'The password of the user',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  password: string;

  @ApiProperty({
    enum: Role,
    enumName: 'Role',
    default: Role.USER,
    description: 'The role of the user',
    required: false,
  })
  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role?: Role;
}