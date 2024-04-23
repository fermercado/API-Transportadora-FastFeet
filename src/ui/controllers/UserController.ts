import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../application/services/UserService';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

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
      const details: ErrorDetail[] = [{ key: 'endpoint', value: 'createUser' }];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to create user', 500, true, details);
      next(appError);
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
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'updateUser' },
        { key: 'userID', value: req.params.id },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to update user', 500, true, details);
      next(appError);
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
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'deleteUser' },
        { key: 'userID', value: req.params.id },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to delete user', 500, true, details);
      next(appError);
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
        const details: ErrorDetail[] = [
          { key: 'userID', value: req.params.id },
        ];
        throw new ApplicationError('User not found', 404, true, details);
      }
      res.status(200).json(user);
    } catch (error) {
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to retrieve user', 500, true, [
              { key: 'endpoint', value: 'getUserById' },
              { key: 'userID', value: req.params.id },
            ]);
      next(appError);
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
      const details: ErrorDetail[] = [
        { key: 'endpoint', value: 'listAllUsers' },
      ];
      const appError =
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list users', 500, true, details);
      next(appError);
    }
  }
}
