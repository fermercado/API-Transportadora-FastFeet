import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { injectable, inject } from 'tsyringe';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

@injectable()
export class AuthController {
  constructor(@inject('AuthService') private authService: AuthService) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { cpf, password } = req.body;
      const authResult = await this.authService.authenticate(cpf, password);
      return res.json({ token: authResult.token, user: authResult.user });
    } catch (error) {
      if (error instanceof ApplicationError) {
        const details: ErrorDetail[] = error.details || [];
        return res.status(error.statusCode).json({
          message: error.message,
          details: details.map((detail) => ({
            key: detail.key,
            value: detail.value,
          })),
        });
      }
      return res.status(500).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred',
        details: [
          { key: 'unexpectedError', value: 'No specific details available' },
        ],
      });
    }
  }
}
