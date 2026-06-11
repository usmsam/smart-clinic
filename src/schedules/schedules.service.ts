import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(@InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>) {}

  async create(doctorId: string, dto: CreateScheduleDto) {
    return this.scheduleModel.create({
      doctorId,
      ...dto,
      isActive: dto.isActive === 'true',
    });
  }

  async findByDoctor(doctorId: string) {
    const schedules = await this.scheduleModel.find({ isActive: true }).sort({ workDay: 1, startTime: 1 }).exec();
    return schedules.filter((schedule) => this.matchesId(schedule.doctorId, doctorId));
  }

  async findAllActive() {
    const schedules = await this.scheduleModel
      .find({ isActive: true })
      .populate({ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] })
      .sort({ workDay: 1, startTime: 1 })
      .exec();

    return schedules.filter((schedule: any) => Boolean(schedule.doctorId));
  }

  async findAllByDoctor(doctorId: string) {
    const schedules = await this.scheduleModel.find().sort({ workDay: 1, startTime: 1 }).exec();
    return schedules.filter((schedule) => this.matchesId(schedule.doctorId, doctorId));
  }

  async findActiveByDoctor(doctorId: string) {
    const schedules = await this.scheduleModel.find({ isActive: true }).sort({ workDay: 1, startTime: 1 }).exec();
    return schedules.filter((schedule) => this.matchesId(schedule.doctorId, doctorId));
  }

  async findForDoctorPage(doctorId: string, legacyDoctorId?: string) {
    const schedules = await this.scheduleModel.find().sort({ workDay: 1, startTime: 1 }).exec();
    return schedules.filter((schedule) => {
      const scheduleDoctorId = String(schedule.doctorId);
      return scheduleDoctorId === String(doctorId) || (legacyDoctorId ? scheduleDoctorId === String(legacyDoctorId) : false);
    });
  }

  async findById(id: string) {
    return this.scheduleModel.findById(id).exec();
  }

  buildTimeSlots(startTime: string, endTime: string, stepMinutes = 30) {
    const slots: string[] = [];
    let current = this.toMinutes(startTime);
    const end = this.toMinutes(endTime);

    while (current + stepMinutes <= end) {
      const slotStart = this.toTime(current);
      const slotEnd = this.toTime(current + stepMinutes);
      slots.push(`${slotStart}-${slotEnd}`);
      current += stepMinutes;
    }

    return slots;
  }

  async remove(id: string) {
    const schedule = await this.findById(id);
    if (!schedule) throw new NotFoundException('Schedule not found');
    await schedule.deleteOne();
    return true;
  }

  private toMinutes(time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private toTime(totalMinutes: number) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private matchesId(value: unknown, expected: string) {
    return String(value) === String(expected) || String((value as any)?._id ?? value) === String(expected);
  }
}
