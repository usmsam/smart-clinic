import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  _id!: Types.ObjectId;

  @Prop({ required: true, ref: 'User' })
  patientId!: Types.ObjectId;

  @Prop({ required: true, ref: 'Doctor' })
  doctorId!: Types.ObjectId;

  @Prop({ required: true, ref: 'Schedule' })
  scheduleId!: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate!: string;

  @Prop({ required: true })
  timeSlot!: string;

  @Prop({ enum: AppointmentStatus, default: AppointmentStatus.Pending })
  status!: AppointmentStatus;

  @Prop({ default: '' })
  notes!: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
