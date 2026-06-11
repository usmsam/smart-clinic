import { Body, Controller, Get, Param, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Render('profile/index')
  async profile(@CurrentUser('sub') id: string) {
    const user = await this.usersService.findById(id);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(@CurrentUser('sub') id: string, @Body() dto: UpdateProfileDto, @Res() res: Response) {
    await this.usersService.updateProfile(id, dto);
    return res.redirect('/profile');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/users')
  @Render('admin/users')
  async adminUsers() {
    return { users: await this.usersService.findAll() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin/users/:id/role')
  async updateRole(@Param('id', ParseObjectIdPipe) id: string, @Body('role') role: Role, @Res() res: Response) {
    await this.usersService.updateRole(id, role);
    return res.redirect('/admin/users');
  }
}
