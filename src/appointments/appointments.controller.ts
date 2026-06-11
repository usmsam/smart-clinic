import { Body, Controller, Get, Logger, Param, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { DoctorsService } from '../doctors/doctors.service';
import { SchedulesService } from '../schedules/schedules.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentsService } from './appointments.service';

@Controller()
export class AppointmentsController {
  private readonly logger = new Logger(AppointmentsController.name);

  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly doctorsService: DoctorsService,
    private readonly schedulesService: SchedulesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Patient)
  @Get('appointments/new')
  @Render('appointments/new')
  async createForm() {
    return {
      schedules: await this.schedulesService.findAllActive(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Patient)
  @Post('appointments')
  async create(
    @CurrentUser('sub') patientId: string,
    @Body() dto: CreateAppointmentDto,
    @Res() res: Response,
  ) {
    await this.appointmentsService.create(patientId, dto);
    return res.redirect('/appointments/my');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Patient)
  @Get('appointments/my')
  @Render('appointments/index')
  async myAppointments(@CurrentUser('sub') patientId: string) {
    return { appointments: await this.appointmentsService.findMyAppointments(patientId) };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Patient)
  @Post('appointments/:id/cancel')
  async cancel(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser('sub') patientId: string, @Res() res: Response) {
    await this.appointmentsService.cancel(id, patientId);
    return res.redirect('/appointments/my');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor)
  @Get('doctor/appointments')
  @Render('doctors/appointments')
  async doctorAppointments(@CurrentUser('sub') userId: string) {
    this.logger.log(`GET /doctor/appointments userId=${userId}`);
    const doctor = await this.doctorsService.findByUserId(userId);
    this.logger.log(
      `doctor lookup result=${doctor ? JSON.stringify({
        _id: doctor._id,
        userId: doctor.userId,
        departmentId: doctor.departmentId,
        specialization: doctor.specialization,
      }) : 'null'}`,
    );
    const appointments = doctor ? await this.appointmentsService.findDoctorAppointments(String(doctor._id)) : [];
    this.logger.log(
      `raw appointments count=${appointments.length} data=${JSON.stringify(
        appointments.map((appointment: any) => ({
          _id: appointment._id,
          doctorId: appointment.doctorId,
          patientId: appointment.patientId,
          scheduleId: appointment.scheduleId?._id ?? appointment.scheduleId,
          status: appointment.status,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
        })),
      )}`,
    );
    return { doctor, appointments };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor)
  @Post('doctor/appointments/:id/status')
  async updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('status') status: AppointmentStatus,
    @Res() res: Response,
  ) {
    await this.appointmentsService.updateStatus(id, status);
    return res.redirect('/doctor/appointments');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/appointments')
  @Render('admin/appointments')
  async adminAppointments() {
    return { appointments: await this.appointmentsService.findAll() };
  }
}
