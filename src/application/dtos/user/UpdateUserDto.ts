import { UserRole } from '../../../domain/enums/UserRole';
export interface UpdateUserDto {
  cpf?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole;
  lastName?: string;
  firstName?: string;
}
