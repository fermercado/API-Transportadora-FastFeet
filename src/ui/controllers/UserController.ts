import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { UserService } from '../../application/services/UserService';

@injectable()
export class UserController {
  constructor(@inject('UserService') private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      await this.userService.deleteUser(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.findUserById(req.params.id);
      return user
        ? res.status(200).json(user)
        : res.status(404).json({ message: 'User not found' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userService.listUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
