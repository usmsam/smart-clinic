import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../common/enums/role.enum';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByActivationToken(token: string) {
    return this.userModel.findOne({ activationToken: token }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByIdWithPassword(id: string) {
    return this.userModel.findById(id).select('+passwordHash').exec();
  }

  async findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async activateUser(token: string) {
    const user = await this.findByActivationToken(token);
    if (!user) {
      throw new NotFoundException('Activation token not found');
    }
    user.isActive = true;
    user.activationToken = null;
    await user.save();
    return user;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.role = role;
    await user.save();
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (dto.fullName) user.fullName = dto.fullName;
    if (typeof dto.telegramId !== 'undefined') user.telegramId = dto.telegramId || null;
    await user.save();
    return user;
  }
}
