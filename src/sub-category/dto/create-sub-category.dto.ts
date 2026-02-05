import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateSubCategoryDto {

    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @Length(3, 30, { message: 'Name must be between 3 and 30 characters long' })
    name: string;

    @IsNotEmpty({ message: 'Category ID is required' })
    @IsString({ message: 'Category ID must be a string' })
    category: string;
    
}
