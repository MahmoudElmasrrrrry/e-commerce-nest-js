import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SuppliersDocument = HydratedDocument<Suppliers>;

@Schema({ timestamps: true })
export class Suppliers {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Name must be at least 3 characters'],
    max: [100, 'Name must be at most 100 characters'],
  })
  name: string;
  
  @Prop({
    type: String,
  })
  website: string;
}

export const SuppliersSchema = SchemaFactory.createForClass(Suppliers);
export const SuppliersModel = MongooseModule.forFeature([{
    name: Suppliers.name, 
    schema: SuppliersSchema 
}]);