import { Body, Controller, Get, Param, Post, Render, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsService } from './departments.service';

@Controller()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('admin/departments')
  @Render('admin/departments')
  async list() {
    return { departments: await this.departmentsService.findAll() };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin/departments')
  async create(@Body() dto: CreateDepartmentDto, @Res() res: Response) {
    await this.departmentsService.create(dto);
    return res.redirect('/admin/departments');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin/departments/:id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: CreateDepartmentDto, @Res() res: Response) {
    await this.departmentsService.update(id, dto);
    return res.redirect('/admin/departments');
  }
}
