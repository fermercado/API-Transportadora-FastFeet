import { UserRole } from '../../domain/enums/UserRole';

export interface UserFilter {
  role?: UserRole;
}
