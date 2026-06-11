import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { Schedule, ScheduleDocument } from '../schedules/schemas/schedule.schema';
import { UsersService } from '../users/users.service';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(patientId: string, dto: CreateAppointmentDto) {
    const schedule = await this.scheduleModel.findById(dto.scheduleId).exec();
    if (!schedule || !schedule.doctorId || !schedule.isActive) {
      throw new NotFoundException('Schedule not found');
    }

    const appointment = await this.appointmentModel.create({
      patientId,
      doctorId: schedule.doctorId,
      scheduleId: dto.scheduleId,
      appointmentDate: schedule.workDay,
      timeSlot: `${schedule.startTime}-${schedule.endTime}`,
      notes: dto.notes || '',
      status: AppointmentStatus.Pending,
    });

    const patient = await this.usersService.findById(patientId);
    if (patient) {
      await this.notificationsService.sendAppointmentEmail(
        patient.email,
        'Appointment created',
        `Your appointment slot ${schedule.workDay} ${schedule.startTime}-${schedule.endTime} has been created.`,
      );
      if (patient.telegramId) {
        await this.notificationsService.sendTelegramMessage(
          patient.telegramId,
          `Appointment created for ${schedule.workDay} ${schedule.startTime}-${schedule.endTime}.`,
        );
      }
    }

    return appointment;
  }

  async findMyAppointments(patientId: string) {
    const appointments = await this.appointmentModel
      .find()
      .populate({ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] })
      .populate({ path: 'scheduleId', populate: [{ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] }] })
      .sort({ createdAt: -1 })
      .exec();

    return appointments.filter((appointment) => this.matchesId(appointment.patientId, patientId));
  }

  async findDoctorAppointments(doctorId: string) {
    const appointments = await this.appointmentModel
      .find()
      .populate({ path: 'patientId' })
      .populate({ path: 'scheduleId', populate: [{ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] }] })
      .sort({ createdAt: -1 })
      .exec();

    return appointments.filter((appointment) => {
      const directDoctorMatch = this.matchesId(appointment.doctorId, doctorId);
      const scheduleDoctorMatch = this.matchesId((appointment as any)?.scheduleId?.doctorId, doctorId);
      return directDoctorMatch || scheduleDoctorMatch;
    });
  }

  async findDoctorAppointmentsForDashboard(doctorId: string) {
    const appointments = await this.appointmentModel
      .find()
      .populate({ path: 'patientId' })
      .populate({ path: 'scheduleId', populate: [{ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] }] })
      .sort({ createdAt: -1 })
      .exec();

    return appointments
      .filter((appointment) => {
        const directDoctorMatch = this.matchesId(appointment.doctorId, doctorId);
        const scheduleDoctorMatch = this.matchesId((appointment as any)?.scheduleId?.doctorId, doctorId);
        return directDoctorMatch || scheduleDoctorMatch;
      })
      .slice(0, 5);
  }

  async findAll() {
    return this.appointmentModel
      .find()
      .populate({ path: 'patientId' })
      .populate({ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] })
      .populate({ path: 'scheduleId', populate: [{ path: 'doctorId', populate: [{ path: 'userId' }, { path: 'departmentId' }] }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) throw new NotFoundException('Appointment not found');
    appointment.status = status;
    await appointment.save();

    const patient = await this.usersService.findById(String(appointment.patientId));
    if (patient) {
      await this.notificationsService.sendAppointmentEmail(
        patient.email,
        'Appointment status updated',
        `Your appointment status changed to ${status}.`,
      );
      if (patient.telegramId) {
        await this.notificationsService.sendTelegramMessage(
          patient.telegramId,
          `Appointment status updated: ${status}.`,
        );
      }
    }

    return appointment;
  }

  async cancel(id: string, patientId: string) {
    const appointment = await this.appointmentModel.findOne({ _id: id, patientId }).exec();
    if (!appointment) throw new NotFoundException('Appointment not found');
    appointment.status = AppointmentStatus.Cancelled;
    await appointment.save();

    const patient = await this.usersService.findById(patientId);
    if (patient) {
      await this.notificationsService.sendAppointmentEmail(
        patient.email,
        'Appointment cancelled',
        `Your appointment on ${appointment.appointmentDate} at ${appointment.timeSlot} has been cancelled.`,
      );
      if (patient.telegramId) {
        await this.notificationsService.sendTelegramMessage(
          patient.telegramId,
          `Appointment cancelled for ${appointment.appointmentDate} at ${appointment.timeSlot}.`,
        );
      }
    }

    return appointment;
  }

  private matchesId(value: unknown, expected: string) {
    return String(value) === String(expected) || String((value as any)?._id ?? value) === String(expected);
  }
}
