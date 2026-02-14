import { IsEnum, IsOptional, IsString } from "class-validator"

export class CreateOrderDto {
    @IsOptional()
    @IsString()
    shippingAddress ?: string

    @IsOptional()
    @IsEnum(['cash', 'card'])
    paymentMethod ?: string
}
