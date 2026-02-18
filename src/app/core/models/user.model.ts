import { Role } from '../enums/role.enum';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  companyId: number;
  isActive: boolean;
}

export interface UserSession {
  user: User;
  token: string;
  expiresAt: string;
}
