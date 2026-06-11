import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { DepartmentsModule } from '../departments/departments.module';
import { Appointment, AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { Doctor, DoctorSchema } from './schemas/doctor.schema';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { UsersModule } from '../users/users.module';
import { Schedule, ScheduleSchema } from '../schedules/schemas/schedule.schema';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    DepartmentsModule,
    MongooseModule.forFeature([
      { name: Doctor.name, schema: DoctorSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}
