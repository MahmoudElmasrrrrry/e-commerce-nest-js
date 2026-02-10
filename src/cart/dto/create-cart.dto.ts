import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId({ message: 'Invalid Product ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsOptional() 
  quantity?: number;

  @IsString({ message: 'Color must be a string' })
  @IsOptional() 
  color?: string;
}
