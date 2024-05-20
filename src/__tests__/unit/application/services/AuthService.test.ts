import 'reflect-metadata';
import { AuthService } from '../../../../application/services/AuthService';
import { UserService } from '../../../../application/services/UserService';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../../domain/enums/UserRole';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked_token'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;
  const mockJwtSecret = 'mock_secret';

  beforeEach(() => {
    mockUserService = {
      validateUser: jest.fn().mockResolvedValue({
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        cpf: '12345678900',
        role: UserRole.Admin,
      }),
    } as any;

    authService = new AuthService(mockUserService, mockJwtSecret);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate method', () => {
    it('should authenticate successfully and return token with user details', async () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked_token');
      const result = await authService.authenticate(
        'valid_cpf',
        'valid_password',
      );
      expect(result.token).toEqual('mocked_token');
      expect(result.user).toEqual({
        name: 'João Silva',
        email: 'joao@example.com',
        role: UserRole.Admin,
      });
    });

    it('should throw an error if credentials are invalid', async () => {
      mockUserService.validateUser.mockResolvedValue(null);
      await expect(
        authService.authenticate('invalid_cpf', 'invalid_password'),
      ).rejects.toThrow(
        new ApplicationError('Invalid CPF or password', 401, true, [
          { key: 'cpf', value: 'invalid_cpf' },
          { key: 'errorReason', value: 'Invalid CPF or password' },
        ]),
      );
    });

    it('should handle token generation errors', async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Token generation failed');
      });
      await expect(
        authService.authenticate('valid_cpf', 'valid_password'),
      ).rejects.toThrow('Token generation failed');
    });
  });

  describe('JWT Secret Handling', () => {
    it('should use the provided jwtSecret for token creation', async () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked_token');
      const customSecretService = new AuthService(
        mockUserService,
        'custom_secret',
      );
      await customSecretService.authenticate('valid_cpf', 'valid_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '1', role: UserRole.Admin },
        'custom_secret',
        { expiresIn: '24h' },
      );
    });

    it('should use the default JWT_SECRET if no secret is provided', () => {
      delete process.env.JWT_SECRET;
      const authServiceDefault = new AuthService(mockUserService);
      expect(authServiceDefault['jwtSecret']).toBe('');
    });

    it('should use the JWT_SECRET environment variable', () => {
      const envSecret = 'env_secret';
      process.env.JWT_SECRET = envSecret;
      const authServiceEnv = new AuthService(mockUserService);
      expect(authServiceEnv['jwtSecret']).toBe(envSecret);
    });
  });
});
