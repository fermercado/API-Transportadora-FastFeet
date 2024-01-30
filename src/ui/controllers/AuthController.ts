import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { injectable, inject } from 'tsyringe';

@injectable()
export class AuthController {
  constructor(@inject('AuthService') private authService: AuthService) {}

  async login(req: Request, res: Response) {
    try {
      const { cpf, password } = req.body;
      const token = await this.authService.authenticate(cpf, password);

      if (!token) {
        return res.status(401).json({ message: 'CPF ou senha inválidos' });
      }

      return res.json({ token });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: 'Erro no servidor', error: error.message });
    }
  }
}
