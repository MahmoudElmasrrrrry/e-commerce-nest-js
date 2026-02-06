import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductModel, ProductSchema } from './product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/category/category.schema';
import {
  SubCategory,
  SubCategorySchema,
} from 'src/sub-category/sub-category.schema';
import { Brand, BrandSchema } from 'src/brand/brand.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: SubCategory.name,
        schema: SubCategorySchema,
      },
      {
        name: Brand.name,
        schema: BrandSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
