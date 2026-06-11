import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>) {}

  async create(dto: CreateDepartmentDto) {
    return this.departmentModel.create(dto);
  }

  async findAll() {
    return this.departmentModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    return this.departmentModel.findById(id).exec();
  }

  async update(id: string, dto: CreateDepartmentDto) {
    const department = await this.findById(id);
    if (!department) throw new NotFoundException('Department not found');
    department.name = dto.name;
    department.description = dto.description || '';
    await department.save();
    return department;
  }

  async remove(id: string) {
    const department = await this.findById(id);
    if (!department) throw new NotFoundException('Department not found');
    await department.deleteOne();
    return true;
  }
}
