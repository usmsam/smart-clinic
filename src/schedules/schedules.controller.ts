import { Body, Controller, Get, Logger, Param, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { DoctorsService } from '../doctors/doctors.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller()
export class SchedulesController {
  private readonly logger = new Logger(SchedulesController.name);

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor)
  @Get('doctor/schedule')
  @Render('doctors/schedule')
  async doctorSchedule(@CurrentUser('sub') userId: string) {
    this.logger.log(`GET /doctor/schedule userId=${userId}`);
    const doctor = await this.doctorsService.findByUserId(userId);
    this.logger.log(
      `doctor lookup result=${doctor ? JSON.stringify({
        _id: doctor._id,
        userId: doctor.userId,
        departmentId: doctor.departmentId,
        specialization: doctor.specialization,
      }) : 'null'}`,
    );
    const legacyDoctorId = doctor ? String((doctor as any).userId?._id ?? (doctor as any).userId ?? '') : '';
    const schedules = doctor ? await this.schedulesService.findForDoctorPage(String(doctor._id), legacyDoctorId || undefined) : [];
    this.logger.log(
      `raw schedules count=${schedules.length} data=${JSON.stringify(
        schedules.map((schedule: any) => ({
          _id: schedule._id,
          doctorId: schedule.doctorId,
          workDay: schedule.workDay,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
        })),
      )}`,
    );
    const scheduleCards = schedules.map((schedule: any) => ({
      ...schedule.toObject?.() ?? schedule,
      slots: this.schedulesService.buildTimeSlots(schedule.startTime, schedule.endTime),
    }));
    this.logger.log(`render schedules count=${scheduleCards.length}`);
    return { doctor, schedules: scheduleCards };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Doctor, Role.Admin)
  @Post('doctor/schedule')
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateScheduleDto, @Res() res: Response) {
    const doctor = await this.doctorsService.findByUserId(userId);
    if (!doctor) {
      return res.redirect('/doctor/dashboard');
    }

    await this.schedulesService.create(String(doctor._id), dto);
    return res.redirect('/doctor/schedule');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin/schedules/:id/delete')
  async remove(@Param('id', ParseObjectIdPipe) id: string, @Res() res: Response) {
    await this.schedulesService.remove(id);
    return res.redirect('/admin/doctors');
  }
}
