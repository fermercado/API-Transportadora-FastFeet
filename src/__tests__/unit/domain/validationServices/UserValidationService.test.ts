import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserValidationService } from '../../../../domain/validationServices/UserValidationService';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UniqueValidationUtils } from '../../../../infrastructure/shared/utils/uniqueValidationUtils';
import { UserValidator } from '../../../../domain/validators/UserValidator';
import { CreateUserDto } from '../../../../application/dtos/user/CreateUserDto';
import { UpdateUserDto } from '../../../../application/dtos/user/UpdateUserDto';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { ZodError, ZodIssue, z } from 'zod';
import { UserRole } from '../../../../domain/enums/UserRole';
import { CommonValidations } from '../../../../domain/validators/commonValidations';
import { User } from '../../../../domain/entities/User';

jest.mock('../../../../domain/repositories/IUserRepository');
jest.mock('../../../../infrastructure/shared/utils/uniqueValidationUtils');

describe('UserValidationService', () => {
  let userValidationService: UserValidationService;
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let uniqueValidationUtilsMock: jest.Mocked<UniqueValidationUtils>;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      create: jest.fn(),
      findByCpf: jest.fn(),
      findByEmail: jest.fn(),
      findByFilter: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;

    uniqueValidationUtilsMock = {
      checkUniqueEmail: jest.fn(),
      checkUniqueCpf: jest.fn(),
    } as any;

    container.registerInstance('IUserRepository', userRepositoryMock);
    container.registerInstance(
      'UniqueValidationUtils',
      uniqueValidationUtilsMock,
    );

    userValidationService = container.resolve(UserValidationService);

    jest.spyOn(UserValidator, 'createBaseSchema').mockReturnValue(
      z.object({
        cpf: CommonValidations.createCpfValidation(),
        firstName: z.string(),
        lastName: z.string(),
        password: z.string(),
        role: z.union([
          z.literal(UserRole.Admin),
          z.literal(UserRole.Deliveryman),
        ]),
        email: z.string().email(),
        isDefaultAdmin: z.boolean().optional(),
        deleteKey: z.string().optional(),
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCreateData', () => {
    it('should throw an error if validation fails', async () => {
      const userData = {} as CreateUserDto;
      const errors: ZodIssue[] = [
        {
          path: ['email'],
          message: 'Invalid email',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ];

      const schema = UserValidator.createBaseSchema();
      jest.spyOn(schema, 'safeParseAsync').mockResolvedValue({
        success: false,
        error: new ZodError(errors),
      });

      await expect(
        userValidationService.validateCreateData(userData),
      ).rejects.toThrow(ApplicationError);
    });

    it('should call validateUniqueness if validation succeeds', async () => {
      const userData = { email: 'test@example.com' } as CreateUserDto;

      const schema = UserValidator.createBaseSchema();
      jest
        .spyOn(schema, 'safeParseAsync')
        .mockResolvedValue({ success: true, data: userData });

      await userValidationService.validateCreateData(userData);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'user',
        undefined,
      );
    });
  });

  describe('validateUpdateData', () => {
    it('should throw an error if validation fails', async () => {
      const userData = {
        email: 'not an email',
      } as UpdateUserDto;
      const errors: ZodIssue[] = [
        {
          path: ['email'],
          message: 'Invalid email',
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
        },
      ];

      const schema = UserValidator.createBaseSchema().partial();
      jest.spyOn(schema, 'safeParseAsync').mockResolvedValue({
        success: false,
        error: new ZodError(errors),
      });

      try {
        await userValidationService.validateUpdateData('1', userData);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.message).toBe('Validation failed');
        expect(error.statusCode).toBe(400);
        expect(error.details).toEqual([
          { key: 'email', value: 'Invalid email' },
        ]);
      }
    });

    it('should call validateUniqueness if validation succeeds', async () => {
      const userData = { email: 'test@example.com' } as UpdateUserDto;

      const schema = UserValidator.createBaseSchema().partial();
      jest.spyOn(schema, 'safeParseAsync').mockResolvedValue({
        success: true,
        data: userData,
      });

      await userValidationService.validateUpdateData('1', userData);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'user',
        '1',
      );
    });
  });

  describe('validateUserExistence', () => {
    it('should throw an error if user does not exist', async () => {
      userRepositoryMock.findById.mockResolvedValue(undefined);

      await expect(
        userValidationService.validateUserExistence('1'),
      ).rejects.toThrow(ApplicationError);
    });

    it('should not throw an error if user exists', async () => {
      userRepositoryMock.findById.mockResolvedValue({
        id: '1',
        cpf: '12345678900',
        password: 'password',
        role: UserRole.Admin,
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        userValidationService.validateUserExistence('1'),
      ).resolves.not.toThrow();
    });
  });

  describe('validateUniqueness', () => {
    it('should call checkUniqueEmail and checkUniqueCpf with correct parameters', async () => {
      const userData = {
        email: 'test@example.com',
        cpf: '123.456.789-00',
      } as CreateUserDto;

      await userValidationService['validateUniqueness'](userData);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'user',
        undefined,
      );

      expect(uniqueValidationUtilsMock.checkUniqueCpf).toHaveBeenCalledWith(
        '123.456.789-00',
        'user',
        undefined,
      );
    });
  });

  describe('validateDeleteSelfOperation', () => {
    it('should throw an error if user tries to delete own account', async () => {
      await expect(
        userValidationService.validateDeleteSelfOperation('1', '1'),
      ).rejects.toThrow(ApplicationError);
    });

    it('should not throw an error if user tries to delete another account', async () => {
      await expect(
        userValidationService.validateDeleteSelfOperation('1', '2'),
      ).resolves.not.toThrow();
    });
  });
  describe('validateDeleteKeyForDefaultAdmin', () => {
    it('should throw an error if user is default admin and provided delete key is incorrect', async () => {
      const user = {
        isDefaultAdmin: true,
        deleteKey: 'correct-delete-key',
      } as User;

      const providedDeleteKey = 'incorrect-delete-key';

      await expect(
        userValidationService.validateDeleteKeyForDefaultAdmin(
          user,
          providedDeleteKey,
        ),
      ).rejects.toThrow(ApplicationError);

      try {
        await userValidationService.validateDeleteKeyForDefaultAdmin(
          user,
          providedDeleteKey,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.message).toBe('Unauthorized operation');
        expect(error.statusCode).toBe(401);
        expect(error.details).toEqual([
          { key: 'deleteKey', value: 'Invalid delete key for default admin.' },
        ]);
      }
    });

    it('should throw an error if user is default admin and delete key is not provided', async () => {
      const user = {
        isDefaultAdmin: true,
        deleteKey: 'correct-delete-key',
      } as User;

      await expect(
        userValidationService.validateDeleteKeyForDefaultAdmin(user),
      ).rejects.toThrow(ApplicationError);

      try {
        await userValidationService.validateDeleteKeyForDefaultAdmin(user);
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationError);
        expect(error.message).toBe('Unauthorized operation');
        expect(error.statusCode).toBe(401);
        expect(error.details).toEqual([
          { key: 'deleteKey', value: 'Invalid delete key for default admin.' },
        ]);
      }
    });

    it('should not throw an error if user is default admin and provided delete key is correct', async () => {
      const user = {
        isDefaultAdmin: true,
        deleteKey: 'correct-delete-key',
      } as User;

      const providedDeleteKey = 'correct-delete-key';

      await expect(
        userValidationService.validateDeleteKeyForDefaultAdmin(
          user,
          providedDeleteKey,
        ),
      ).resolves.not.toThrow();
    });

    it('should not throw an error if user is not default admin', async () => {
      const user = {
        isDefaultAdmin: false,
      } as User;

      await expect(
        userValidationService.validateDeleteKeyForDefaultAdmin(user),
      ).resolves.not.toThrow();
    });
  });
});
