import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({ timestamps: true })
export class Doctor {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true, ref: 'Department' })
  departmentId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  specialization!: string;

  @Prop({ default: '' })
  experience!: string;

  @Prop({ default: '' })
  roomNumber!: string;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
