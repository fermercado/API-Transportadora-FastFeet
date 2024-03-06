import { AuthResult, UserDetails } from '../interfaces/IAuthService';
import { injectable } from 'tsyringe';
import jwt, { Secret } from 'jsonwebtoken';
import { UserService } from './UserService';

const JWT_SECRET: Secret = process.env.JWT_SECRET || '';

@injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async authenticate(
    cpf: string,
    password: string,
  ): Promise<AuthResult | null> {
    const user = await this.userService.validateUser(cpf, password);

    if (!user) {
      return null;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const userDetails: UserDetails = {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      role: user.role,
    };

    const authResult: AuthResult = {
      token,
      user: userDetails,
    };

    return authResult;
  }
}
