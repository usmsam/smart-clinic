import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { UsersModule } from '../users/users.module';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Schedule, ScheduleSchema } from '../schedules/schemas/schedule.schema';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    CommonModule,
    DoctorsModule,
    SchedulesModule,
    UsersModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
