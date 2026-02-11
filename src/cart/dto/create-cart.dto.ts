import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsNotEmpty()
  @IsString()
  color: string;
}
