import { UserRole } from '../../../domain/enums/UserRole';
export interface CreateUserDto {
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  lastName: string;
  firstName: string;
}
