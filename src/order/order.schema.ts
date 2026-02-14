import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Product } from "src/product/product.schema";
import { User } from "src/user/user.schema";

export type OrderDocument = HydratedDocument<Order>;
@Schema({timestamps: true})
export class Order{
    @Prop({
        type:Types.ObjectId,
        ref:User.name,
        required:true
    })
    user:Types.ObjectId;

    @Prop({
        type:[
            {
                product:{
                    type:Types.ObjectId,
                    ref: Product.name,
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                },
                color: String,
                price:{
                    type:Number,
                    required:true
                }
            }
        ]
    })
    cartItems:{
        product:Types.ObjectId,
        quantity:number,
        color:string,
        price:number
    }[];

    @Prop({type: Number, required: true})
    totalPrice:number;
    
    @Prop({type: Number, default: 0})
    totalAfterDiscount:number


    @Prop({type: Number, default: 0})
    shippingPrice:number

    @Prop({type: Number, default: 0})
    taxPrice:number

    @Prop({type: Number, required: true})
    totalOrderPrice:number

    @Prop({type: String, required: true})
    shippingAddress: string

    @Prop({
        type: String,
        enum: ['cash', 'card'],
        default: 'cash',
    })
    paymentMethod: string


    @Prop({type: Boolean, default: false})
    isPaid: boolean

    @Prop({
        type:{
            id: String,
            status: String,
            update_time: Date,
            email_address: String
        },
        _id: false
    })
    paymentResult: {
        id: string;
        status: string;
        update_time: Date;
        email_address: string;
    }

    @Prop({type: Boolean, default: false})
    isDelivered: boolean

    @Prop({type: Date})
    deliveredAt: Date

    @Prop({type: Boolean, default: false})
    iscanceled: boolean

    @Prop({type: Date})
    canceledAt: Date

}
export const OrderSchema = SchemaFactory.createForClass(Order);
export const OrderModel = MongooseModule.forFeature([
    {
        name: Order.name,
        schema: OrderSchema,
    },
])