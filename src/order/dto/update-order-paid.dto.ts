import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateOrderPaidDto {
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsString({ message: 'Payment ID must be a string' })
  id: string;

  @IsNotEmpty({ message: 'Payment status is required' })
  @IsString({ message: 'Payment status must be a string' })
  status: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email_address?: string;
}