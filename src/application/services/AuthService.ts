import { injectable, inject } from 'tsyringe';
import jwt, { Secret } from 'jsonwebtoken';
import { UserService } from './UserService';
import { AuthResult, UserDetails } from '../interfaces/IAuthService';
import { UserRole } from '../../domain/enums/UserRole';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || '';

@injectable()
export class AuthService {
  constructor(@inject(UserService) private userService: UserService) {}

  async authenticate(cpf: string, password: string): Promise<AuthResult> {
    const user = await this.userService.validateUser(cpf, password);
    if (!user) {
      const errorDetails: ErrorDetail[] = [
        { key: 'cpf', value: cpf },
        { key: 'errorReason', value: 'Invalid CPF or password' },
      ];
      throw new ApplicationError(
        'Invalid CPF or password',
        401,
        true,
        errorDetails,
      );
    }

    const token = this.createToken(user);
    const userDetails = this.createUserDetails(user);

    return {
      token,
      user: userDetails,
    };
  }

  private createToken(user: { id: string; role: UserRole }): string {
    return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  private createUserDetails(user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  }): UserDetails {
    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    };
  }
}
