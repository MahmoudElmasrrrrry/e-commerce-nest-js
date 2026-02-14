import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateOrderPaidDto {
  @IsNotEmpty()
  @IsString()
  id: string; 

  @IsNotEmpty()
  @IsString()
  status: string; 

  @IsOptional()
  @IsEmail()
  email_address?: string;
}