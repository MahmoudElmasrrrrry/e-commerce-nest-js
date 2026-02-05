import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role, Sex } from 'src/utils/decorator/roles.enum';
import { hashing } from 'src/utils/security/bcrypt';
export type UserDocument = HydratedDocument<User>;
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
    set: (password: string) => {
      const hashedPassword = hashing(password);
      return hashedPassword;
    }
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    default: Role.User,
    enum: Object.values(Role),
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

  @Prop({
    type: String,
  })
  address: string;

  @Prop({
    type: Boolean,
    enum: [true, false],
  })
  active: boolean;

  @Prop({
    type:{
      code:{
        type: String,
        default: null,
      },
      expiresAt:{
        type: Date,
        default: null,
      }
    },
    _id: false,
  })  
  verificationCode : {
    expiresAt: Date | null;
    code: string | null;
  };

  @Prop({
    type: String,
    enum: Object.values(Sex),
    default: Sex.Male,
  })
  gender: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
