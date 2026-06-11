import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ enum: Role, default: Role.Patient })
  role!: Role;

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ type: String, default: null })
  activationToken!: string | null;

  @Prop({ type: String, default: null })
  telegramId!: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
