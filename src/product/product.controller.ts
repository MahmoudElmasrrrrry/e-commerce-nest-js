import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from 'src/utils/decorator/roles.enum';
import { AuthGuard } from 'src/utils/guard/Auth.guard';
import { Types } from 'mongoose';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  //docs    Admin can create product
  //route   POST api/v1/product
  //access  Private (admin)
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createProductDto: CreateProductDto,
  ) {
    return this.productService.create(createProductDto);
  }

  //docs    Admin can get products
  //route   GET api/v1/product
  //access  Private (admin)
  @Get()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  findAll(@Query() query) {
    return this.productService.findAll(query);
  }

  //docs    Admin can get specific product
  //route   GET api/v1/product/:id
  //access  Private (admin)
  @Get(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: Types.ObjectId) {
    return this.productService.findOne(id);
  }

  //docs    Admin can update product
  //route   PATCH api/v1/product/:id
  //access  Private (admin)
  @Patch(':id')
  update(@Param('id') id: Types.ObjectId, @Body(new ValidationPipe({ whitelist: true, transform: true })) updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  //docs    Admin can delete  product
  //route   DELETE api/v1/product/:id
  //access  Private (admin)

  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: Types.ObjectId) {
    return this.productService.remove(id);
  }
}
