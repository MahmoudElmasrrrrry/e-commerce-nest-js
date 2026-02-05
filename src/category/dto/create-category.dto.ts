import { IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @Length(3, 30, { message: 'Name must be between 3 and 30 characters long' })
    name: string;

    @IsString({ message: 'Image must be a string' })
    @IsUrl({}, { message: 'Image must be a valid URL' })
    @IsOptional()
    image?: string;
}
