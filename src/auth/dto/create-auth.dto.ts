import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class signUpDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(30, { message: 'Name must be less than 30 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must be less than 50 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'Role must be a string' })
  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  @IsOptional()
  role: string;

  @IsString({ message: 'Avatar must be a string' })
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  @IsOptional()
  avatar: string;

  @IsNumber({}, { message: 'Age must be a number' })
  @IsOptional()
  age: number;

  @IsPhoneNumber('EG', {
    message: 'Phone number must be a valid Egyptian phone number',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  phoneNumber: string;

  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  address: string;

  @IsString({ message: 'Gender must be a string' })
  @IsEnum(['male', 'female'], {
    message: 'Gender must be either male or female',
  })
  @IsOptional()
  gender: string;
}

export class verifyEmailDto{
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Code must be a string' }) 
    @IsNotEmpty({ message: 'Code is required' })    
    code: string;
}

export class loginDto {
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
