import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

@Schema({ timestamps: true })
export class Schedule {
  _id!: Types.ObjectId;

  @Prop({ required: true, ref: 'Doctor' })
  doctorId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  workDay!: string;

  @Prop({ required: true, trim: true })
  startTime!: string;

  @Prop({ required: true, trim: true })
  endTime!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
