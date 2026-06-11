import { Body, Controller, Get, Param, Post, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  registerPage() {
    return { title: 'Register' };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    await this.authService.register(dto);
    return res.redirect('/auth/login?registered=1');
  }

  @Get('login')
  @Render('auth/login')
  loginPage() {
    return { title: 'Login' };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, user } = await this.authService.login(dto);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.redirect(this.getDashboardPath(user.role));
  }

  @Get('logout')
  logout(@Res() res: Response) {
    return res.clearCookie('access_token').redirect('/');
  }

  @Get('activate/:token')
  async activate(@Param('token') token: string, @Res() res: Response) {
    await this.authService.activate(token);
    return res.redirect('/auth/login?activated=1');
  }

  private getDashboardPath(role: Role) {
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
