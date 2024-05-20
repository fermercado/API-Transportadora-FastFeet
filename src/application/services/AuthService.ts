import { injectable, inject } from 'tsyringe';
import jwt, { Secret } from 'jsonwebtoken';
import { UserService } from './UserService';
import { AuthResult, UserDetails } from '../interfaces/IAuthService';
import { UserRole } from '../../domain/enums/UserRole';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

@injectable()
export class AuthService {
  private jwtSecret: Secret;

  constructor(
    @inject('UserService') private userService: UserService,
    @inject('JWT_SECRET') jwtSecret: Secret = process.env.JWT_SECRET || '',
  ) {
    this.jwtSecret = jwtSecret;
  }

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
    return jwt.sign({ userId: user.id, role: user.role }, this.jwtSecret, {
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
