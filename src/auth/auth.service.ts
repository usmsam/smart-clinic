import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Role } from '../common/enums/role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const activationToken = randomUUID();

    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      role: Role.Patient,
      isActive: false,
      activationToken,
      telegramId: null,
    });

    const activationLink = `${this.configService.get('appUrl')}/auth/activate/${activationToken}`;
    await this.notificationsService.sendActivationEmail(user.email, activationLink);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Please activate your account');
    }

    const withPassword = await this.usersService.findByIdWithPassword(String(user._id));
    const valid = await bcrypt.compare(dto.password, withPassword?.passwordHash || '');

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isActive: user.isActive,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user };
  }

  async activate(token: string) {
    return this.usersService.activateUser(token);
  }
}
