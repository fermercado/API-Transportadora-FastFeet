import { UserRole } from '../../../domain/enums/UserRole';
export interface CreateUserDto {
  lastName: string;
  firstName: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}
