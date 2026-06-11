import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
