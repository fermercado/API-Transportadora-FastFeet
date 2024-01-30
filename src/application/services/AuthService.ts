import jwt, { Secret } from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { UserService } from './UserService';

const JWT_SECRET: Secret = process.env.JWT_SECRET || '';

@injectable()
export class AuthService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async authenticate(cpf: string, password: string): Promise<string | null> {
    const user = await this.userService.validateUser(cpf, password);

    if (!user) {
      return null;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });
    return token;
  }
}
