import { IsDateString, IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString({ message: 'name must be a string' })
  @Length(3, 100, { message: 'name must be between 3 and 100 characters' })
  name: string;
  @IsString({ message: 'expireDate must be a string' })
  @IsDateString(
    {},
    {
      message:
        'expireDate must be a valid date string in the format YYYY-MM-DD',
    },
  )
  expireDate: string;
  @IsNumber({}, { message: 'discount must be a number' })
  @Min(0, { message: 'discount must be at least 0' })
  discount: number;
}
