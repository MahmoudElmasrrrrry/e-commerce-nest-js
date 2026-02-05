import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';
export type UserDocument = HydratedDocument<User>;
const SALT_ROUNDS = 10;
@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Name is too short'],
    max: [30, 'Name is too long'],
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    min: [6, 'Password is too short'],
    max: [50, 'Password is too long'],
    set: (password: string) => {
      const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
      return hashedPassword;
    }
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin'],
  })
  role: string;

  @Prop({
    type: String,
  })
  avatar: string;

  @Prop({
    type: Number,
  })
  age: number;

  @Prop({
    type: String,

  })
  phoneNumber: string;

  address: string;

  @Prop({
    type: Boolean,
    enum: [true, false],
  })
  active: boolean;

  verificationCode : string;

  @Prop({
    type: String,
    enum: ['male', 'female'],
    default: 'male',
  })
  gender: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
