import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../../../application/services/AuthService';
import { AuthController } from '../../../../ui/controllers/AuthController';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';

jest.mock('../../../../application/services/AuthService');

describe('AuthController', () => {
  let authServiceMock: jest.Mocked<AuthService>;
  let authController: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    authServiceMock = new AuthService({} as any) as jest.Mocked<AuthService>;
    authController = new AuthController(authServiceMock);

    req = {
      body: {},
    };
    jsonMock = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    };
    next = jest.fn();
  });

  it('should return a token and user on successful login', async () => {
    const mockToken = 'mockToken';
    const mockUser = {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      role: 'admin' as 'admin' | 'deliveryman',
    };
    authServiceMock.authenticate.mockResolvedValue({
      token: mockToken,
      user: mockUser,
    });

    req.body = { cpf: '123.456.789-09', password: 'password' };

    await authController.login(req as Request, res as Response, next);

    expect(authServiceMock.authenticate).toHaveBeenCalledWith(
      '123.456.789-09',
      'password',
    );
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: mockUser,
    });
  });

  it('should return an error response for ApplicationError', async () => {
    const errorDetails = [{ key: 'cpf', value: 'Invalid CPF' }];
    const error = new ApplicationError(
      'Invalid credentials',
      401,
      true,
      errorDetails,
    );

    authServiceMock.authenticate.mockRejectedValue(error);

    req.body = { cpf: '123.456.789-09', password: 'wrongpassword' };

    await authController.login(req as Request, res as Response, next);

    expect(authServiceMock.authenticate).toHaveBeenCalledWith(
      '123.456.789-09',
      'wrongpassword',
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return an error response for ApplicationError with empty details', async () => {
    const error = new ApplicationError('Invalid credentials', 401, true);

    authServiceMock.authenticate.mockRejectedValue(error);

    req.body = { cpf: '123.456.789-09', password: 'wrongpassword' };

    await authController.login(req as Request, res as Response, next);

    expect(authServiceMock.authenticate).toHaveBeenCalledWith(
      '123.456.789-09',
      'wrongpassword',
    );
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return a 500 response for unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    authServiceMock.authenticate.mockRejectedValue(unexpectedError);

    req.body = { cpf: '123.456.789-09', password: 'password' };

    await authController.login(req as Request, res as Response, next);

    expect(authServiceMock.authenticate).toHaveBeenCalledWith(
      '123.456.789-09',
      'password',
    );
    expect(next).toHaveBeenCalledWith(
      new ApplicationError('Failed to authenticate user', 500, true, [
        { key: 'unexpectedError', value: 'No specific details available' },
      ]),
    );
  });
});
