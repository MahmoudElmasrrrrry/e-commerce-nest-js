import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from 'src/category/category.schema';
export type SubCategoryDocument = HydratedDocument<SubCategory>;
@Schema({ timestamps: true })
export class SubCategory {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Name is too short'],
    max: [30, 'Name is too long'],
  })
  name: string;
  
  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
  })
  category: string;

 
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
