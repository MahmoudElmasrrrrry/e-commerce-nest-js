import { 
  IsArray, 
  IsMongoId, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title is too short' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(20, { message: 'Description is too short' })
  description: string;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty()
  @Min(0, { message: 'Quantity cannot be less than 0' })
  quantity: number;

  @IsNumber({}, { message: 'Price must be a number' })
  @IsNotEmpty()
  @Min(0, { message: 'Price cannot be less than 0' })
  price: number;

  @IsNumber({}, { message: 'Price After Discount must be a number' })
  @IsOptional()
  @Min(0)
  priceAfterDiscount?: number;

  @IsString()
  @IsNotEmpty({ message: 'Image Cover is required' })
  imageCover: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];

  @IsMongoId({ message: 'Invalid Category ID' })
  @IsNotEmpty()
  category: string;

  @IsMongoId({ message: 'Invalid SubCategory ID' })
  @IsNotEmpty()
  subCategory: string;

  @IsMongoId({ message: 'Invalid Brand ID' })
  @IsOptional()
  brand: string;

}