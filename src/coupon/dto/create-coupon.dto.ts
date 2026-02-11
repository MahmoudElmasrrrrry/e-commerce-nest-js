import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expireDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Discount must be at least 1%' })
  @Max(100, { message: 'Discount cannot exceed 100%' })
  discount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsage?: number;
}