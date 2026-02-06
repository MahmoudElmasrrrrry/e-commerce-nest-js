import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaxDocument = HydratedDocument<Tax>;

@Schema({ timestamps: true })
export class Tax {
  @Prop({
    type: Number,
    default: 0,
  })
  taxPrice: number;
  @Prop({
    type: Number,
    default: 0,
  })
  shippingPrice: number;
}

export const TaxSchema = SchemaFactory.createForClass(Tax);
export const TaxModel = MongooseModule.forFeature([
    {
        name: Tax.name,
        schema: TaxSchema
    }
])