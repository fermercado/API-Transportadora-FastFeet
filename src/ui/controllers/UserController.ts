import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../application/services/UserService';
import { ApplicationError } from '../../shared/errors/ApplicationError';

@injectable()
export class UserController {
  constructor(@inject('UserService') private userService: UserService) {}

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(new ApplicationError('Failed to create user', 500));
      }
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(new ApplicationError('Failed to update user', 500));
      }
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(new ApplicationError('Failed to delete user', 500));
      }
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await this.userService.findUserById(req.params.id);
      if (!user) {
        throw new ApplicationError('User not found', 404);
      }
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(new ApplicationError('Failed to retrieve user', 500));
      }
    }
  }

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json(users);
    } catch (error) {
      if (error instanceof ApplicationError) {
        next(error);
      } else {
        next(new ApplicationError('Failed to list users', 500));
      }
    }
  }
}
