import { Controller, Get, Render, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from './common/decorators/current-user.decorator';
import { Role } from './common/enums/role.enum';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

@Controller()
export class AppController {
  @Get()
  @Render('home')
  home() {
    return { title: 'Smart Clinic Appointment' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  dashboard(@CurrentUser() user: any, @Res() res: Response) {
    return res.redirect(this.getDashboardPath(user?.role));
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient/dashboard')
  @Render('dashboards/patient')
  patientDashboard(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/dashboard')
  @Render('dashboards/doctor')
  doctorDashboard(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/dashboard')
  @Render('dashboards/admin')
  adminDashboard(@CurrentUser() user: any) {
    return { user };
  }

  @UseInterceptors(new ResponseTransformInterceptor())
  @Get('api/status')
  status() {
    return { status: 'ok' };
  }

  private getDashboardPath(role: Role | undefined) {
    switch (role) {
      case Role.Admin:
        return '/admin/dashboard';
      case Role.Doctor:
        return '/doctor/dashboard';
      default:
        return '/patient/dashboard';
    }
  }
}
