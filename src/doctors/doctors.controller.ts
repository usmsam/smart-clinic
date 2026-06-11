import { Body, Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { DoctorsService } from './doctors.service';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from '../departments/departments.service';
import { Appointment, AppointmentDocument } from '../appointments/schemas/appointment.schema';
import { Schedule, ScheduleDocument } from '../schedules/schemas/schedule.schema';

@Controller()
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
    private readonly departmentsService: DepartmentsService,
    @InjectModel(Schedule.name) private readonly scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Appointment.name) private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  @Get('doctors')
  @Render('doctors/index')
  async publicDoctors() {
    return { doctors: await this.doctorsService.findPublic() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/doctors')
  @Render('admin/doctors')
  async adminDoctors() {
    const [doctors, users, departments] = await Promise.all([
      this.doctorsService.findAll(),
      this.usersService.findAll(),
      this.departmentsService.findAll(),
    ]);
    return { doctors, users, departments };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin/doctors')
  async create(@Body() dto: CreateDoctorDto, @Res() res: Response) {
    await this.doctorsService.upsertByUserId(dto);
    return res.redirect('/admin/doctors');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor)
  @Get('doctor/dashboard')
  @Render('doctors/dashboard')
  async doctorDashboard(@CurrentUser('sub') userId: string) {
    const doctor = await this.doctorsService.findByUserId(userId);
    const schedules = doctor
      ? await this.scheduleModel.find({ doctorId: doctor._id, isActive: true }).sort({ workDay: 1, startTime: 1 }).exec()
      : [];
    const appointments = doctor
      ? await this.appointmentModel
          .find({ doctorId: doctor._id })
          .populate({ path: 'patientId' })
          .populate({ path: 'scheduleId' })
          .sort({ createdAt: -1 })
          .limit(5)
          .exec()
      : [];
    return { doctor, schedules, appointments };
  }
}
