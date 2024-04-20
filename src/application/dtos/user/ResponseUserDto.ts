import { UserRole } from '../../../domain/enums/UserRole';
export class UserResponseDto {
  id!: string;
  cpf!: string;
  role!: UserRole;
  firstName!: string;
  lastName!: string;
  email!: string;
}
