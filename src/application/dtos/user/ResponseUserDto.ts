import { UserRole } from '../../../domain/enums/UserRole';
export class ResponseUserDto {
  id!: string;
  cpf!: string;
  role!: UserRole;
  firstName!: string;
  lastName!: string;
  email!: string;
}
