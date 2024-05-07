import { UserRole } from '../../../domain/enums/UserRole';
export interface UpdateUserDto {
  lastName?: string;
  firstName?: string;
  cpf?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole;
}
