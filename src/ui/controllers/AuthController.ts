import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { injectable, inject } from 'tsyringe';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

@injectable()
export class AuthController {
  constructor(@inject('AuthService') private authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cpf, password } = req.body;
      const authResult = await this.authService.authenticate(cpf, password);
      res.json({ token: authResult.token, user: authResult.user });
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to authenticate user', 500, true, [
              {
                key: 'unexpectedError',
                value: 'No specific details available',
              },
            ]),
      );
    }
  }
}
