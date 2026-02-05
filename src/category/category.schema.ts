import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CategoryDocument = HydratedDocument<Category>;
@Schema({ timestamps: true })
export class Category {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Name is too short'],
    max: [30, 'Name is too long'],
  })
  name: string;
  
  @Prop({
    type: String,
  })
  image: string;

 
}

export const CategorySchema = SchemaFactory.createForClass(Category);
