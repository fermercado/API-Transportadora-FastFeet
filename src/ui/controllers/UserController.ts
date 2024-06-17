import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../application/services/UserService';
import { DeleteUserDto } from '../../application/dtos/user/DeleteUserDto';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to create user', 500, true, [
              { key: 'internal', value: 'Error during user creation' },
            ]),
      );
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
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to update user', 500, true, [
              { key: 'internal', value: 'Error during user update' },
            ]),
      );
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deleteUserDto: DeleteUserDto = {
        id: req.params.id,
        loggedInUserId: req.user.id,
        providedDeleteKey: req.body.deleteKey,
      };
      await this.userService.deleteUser(deleteUserDto);
      res.status(204).send();
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to delete user', 500, true, [
              { key: 'internal', value: 'Error during user deletion' },
            ]),
      );
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
      next(error);
    }
  }

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const users = await this.userService.listUsers(role);
      res.status(200).json(users);
    } catch (error) {
      next(
        error instanceof ApplicationError
          ? error
          : new ApplicationError('Failed to list users', 500, true, [
              { key: 'internal', value: 'Error during user listing' },
            ]),
      );
    }
  }
}
