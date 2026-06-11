import { Role } from '../enums/role.enum';

export type RequestUser = {
  sub: string;
  email: string;
  role: Role;
  fullName: string;
  isActive: boolean;
};

