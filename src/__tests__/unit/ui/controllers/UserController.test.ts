import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../../../application/services/UserService';
import { UserController } from '../../../../ui/controllers/UserController';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { UserMapper } from '../../../../application/mappers/UserMappers';
import { UserValidationService } from '../../../../domain/validation/UserValidationService';
import { UserRepository } from '../../../../infrastructure/orm/repositories/UserRepository';
import { UserRole } from '../../../../domain/enums/UserRole';

jest.mock('../../../../application/services/UserService');
jest.mock('../../../../application/mappers/UserMappers');
jest.mock('../../../../domain/validation/UserValidationService');
jest.mock('../../../../infrastructure/orm/repositories/UserRepository');

describe('UserController', () => {
  let userServiceMock: jest.Mocked<UserService>;
  let userController: UserController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    const userValidationService = new UserValidationService(
      {} as any,
      {} as any,
    );
    const userRepository = new UserRepository({} as any);
    const userMapper = new UserMapper();

    userServiceMock = new UserService(
      userRepository,
      userValidationService,
      userMapper,
      {} as any,
    ) as jest.Mocked<UserService>;

    userController = new UserController(userServiceMock);

    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'logged-in-user-id' } as any,
    };
    jsonMock = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should create a user and return 201 status', async () => {
    const mockUser = {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '123.456.789-09',
      email: 'joao.silva@example.com',
      role: UserRole.Admin,
    };
    userServiceMock.createUser.mockResolvedValue(mockUser);

    req.body = { name: 'João Silva' };

    await userController.createUser(req as Request, res as Response, next);

    expect(userServiceMock.createUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should handle create user errors', async () => {
    const error = new Error('Test error');
    userServiceMock.createUser.mockRejectedValue(error);

    req.body = { name: 'João Silva' };

    await userController.createUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to create user', 500, true, [
        { key: 'internal', value: 'Error during user creation' },
      ]),
    );
  });

  it('should update a user and return 200 status', async () => {
    const mockUser = {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '123.456.789-09',
      email: 'joao.silva@example.com',
      role: UserRole.Admin,
    };
    userServiceMock.updateUser.mockResolvedValue(mockUser);

    req.params = { id: '1' };
    req.body = { name: 'João Silva Updated' };

    await userController.updateUser(req as Request, res as Response, next);

    expect(userServiceMock.updateUser).toHaveBeenCalledWith('1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should handle update user errors', async () => {
    const error = new Error('Test error');
    userServiceMock.updateUser.mockRejectedValue(error);

    req.params = { id: '1' };
    req.body = { name: 'João Silva Updated' };

    await userController.updateUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to update user', 500, true, [
        { key: 'internal', value: 'Error during user update' },
      ]),
    );
  });

  it('should delete a user and return 204 status', async () => {
    req.params = { id: '1' };
    req.user = { id: 'logged-in-user-id' } as any;

    await userController.deleteUser(req as Request, res as Response, next);

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(
      '1',
      'logged-in-user-id',
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should handle delete user errors', async () => {
    const error = new Error('Test error');
    userServiceMock.deleteUser.mockRejectedValue(error);

    req.params = { id: '1' };
    req.user = { id: 'logged-in-user-id' } as any;

    await userController.deleteUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to delete user', 500, true, [
        { key: 'internal', value: 'Error during user deletion' },
      ]),
    );
  });

  it('should return a user by id and return 200 status', async () => {
    const mockUser = {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '123.456.789-09',
      email: 'joao.silva@example.com',
      role: UserRole.Admin,
    };
    userServiceMock.findUserById.mockResolvedValue(mockUser);

    req.params = { id: '1' };

    await userController.getUserById(req as Request, res as Response, next);

    expect(userServiceMock.findUserById).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should handle user not found', async () => {
    userServiceMock.findUserById.mockResolvedValue(undefined);

    req.params = { id: '1' };

    await userController.getUserById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('User not found', 404),
    );
  });

  it('should handle getUserById errors', async () => {
    const error = new Error('Test error');
    userServiceMock.findUserById.mockRejectedValue(error);

    req.params = { id: '1' };

    await userController.getUserById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return all users and return 200 status', async () => {
    const mockUsers = [
      {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao.silva@example.com',
        role: UserRole.Admin,
      },
    ];
    userServiceMock.listUsers.mockResolvedValue(mockUsers);

    req.query = { role: 'admin' };

    await userController.getAllUsers(req as Request, res as Response, next);

    expect(userServiceMock.listUsers).toHaveBeenCalledWith('admin');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should handle getAllUsers errors', async () => {
    const error = new Error('Test error');
    userServiceMock.listUsers.mockRejectedValue(error);

    await userController.getAllUsers(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to list users', 500, true, [
        { key: 'internal', value: 'Error during user listing' },
      ]),
    );
  });
});
