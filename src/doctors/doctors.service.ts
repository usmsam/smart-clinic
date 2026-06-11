import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(@InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>) { }

  async create(dto: CreateDoctorDto) {
    return this.upsertByUserId(dto);
  }

  async upsertByUserId(dto: CreateDoctorDto) {
    const existing = await this.doctorModel.findOne({ userId: dto.userId }).exec();
    if (existing) {
      existing.departmentId = dto.departmentId as any;
      existing.specialization = dto.specialization;
      existing.experience = dto.experience || '';
      existing.roomNumber = dto.roomNumber || '';
      await existing.save();
      return existing;
    }

    return this.doctorModel.create(dto);
  }

  async findAll() {
    return this.doctorModel.find().populate('userId').populate('departmentId').sort({ createdAt: -1 }).exec();
  }

  async findPublic() {
    return this.doctorModel.find().populate('userId').populate('departmentId').sort({ specialization: 1 }).exec();
  }

  async findById(id: string) {
    return this.doctorModel.findById(id).populate('userId').populate('departmentId').exec();
  }

  async findByUserId(userId: string) {
    const objectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
    const query = objectId
      ? { $or: [{ userId: objectId }, { userId }] }
      : { userId };

    const doctor = await this.doctorModel
      .findOne(query)
      .populate('userId')
      .populate('departmentId')
      .sort({ createdAt: -1 })
      .exec();

    if (doctor) {
      return doctor;
    }

    const doctors = await this.doctorModel.find().populate('userId').populate('departmentId').exec();
    return (
      doctors.find((entry: any) => {
        const entryUserId = entry?.userId?._id ?? entry?.userId;
        return String(entryUserId) === String(userId);
      }) || null
    );
  }

  async update(id: string, dto: CreateDoctorDto) {
    const doctor = await this.findById(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    doctor.userId = dto.userId as any;
    doctor.departmentId = dto.departmentId as any;
    doctor.specialization = dto.specialization;
    doctor.experience = dto.experience || '';
    doctor.roomNumber = dto.roomNumber || '';
    await doctor.save();
    return doctor;
  }

  async remove(id: string) {
    const doctor = await this.findById(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    await doctor.deleteOne();
    return true;
  }
}
