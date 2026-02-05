import { IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class CreateBrandDto {

    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @Length(3, 100, { message: 'Name must be between 3 and 100 characters long' })
    name: string;

    @IsOptional()
    @IsUrl({}, { message: 'Image must be a valid URL' })
    @IsString({ message: 'Image must be a URL string' })
    image?: string;
}
