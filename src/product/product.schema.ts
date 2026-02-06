import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/category/category.schema';
import { Brand } from 'src/brand/brand.schema';
import { SubCategory } from 'src/sub-category/sub-category.schema';
export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Product {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
  })
  title: string;

  @Prop({
    type: String,
    lowercase: true,
    unique: true,
  })
  slug: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
  })
  description: string;

  @Prop({
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be less than 0'],
    default: 1,
  })
  quantity: number;

  @Prop({
    type: Number,
    default: 0,
  })
  sold: number;

  @Prop({
    type: Number,
    required: true,
    min: [0, 'Price must be positive'],
  })
  price: number;

  @Prop({
    type: Number,
    default: 0,
  })
  priceAfterDiscount: number;

  @Prop({
    type: [String],
  })
  colors: string[];

  @Prop({
    type: String,
    required: true,
  })
  imageCover: string;

  @Prop({
    type: [String],
  })
  images: string[];

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: SubCategory.name,
    required: true,
  })
  subCategory: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Brand.name,
  })
  brand: Types.ObjectId;

  @Prop({
    type: Number,
    default: 0, 
    min: [0, 'Rating must be above or equal 0'],
    max: [5, 'Rating must be below or equal 5'],
  })
  ratingsAverage: number;

  @Prop({
    type: Number,
    default: 0,
  })
  ratingsQuantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export const ProductModel = MongooseModule.forFeature([
    {
        name: Product.name,
        schema: ProductSchema
    }
])

