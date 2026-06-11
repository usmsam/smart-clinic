import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../common/common.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [CommonModule, MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }]), DoctorsModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
