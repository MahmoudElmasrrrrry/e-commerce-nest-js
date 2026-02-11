import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  color?: string;
}
