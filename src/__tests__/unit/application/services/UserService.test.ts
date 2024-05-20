import 'reflect-metadata';
import { UserService } from '../../../../application/services/UserService';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { UserValidationService } from '../../../../domain/validation/UserValidationService';
import { UserMapper } from '../../../../application/mappers/UserMappers';
import { PasswordHasher } from '../../../../infrastructure/shared/utils/PasswordHasher';
import { CreateUserDto } from '../../../../application/dtos/user/CreateUserDto';
import { ResponseUserDto } from '../../../../application/dtos/user/ResponseUserDto';
import { User } from '../../../../domain/entities/User';
import { UserRole } from '../../../../domain/enums/UserRole';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { UpdateUserDto } from '../../../../application/dtos/user/UpdateUserDto';
import bcrypt from 'bcrypt';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUserValidationService: jest.Mocked<UserValidationService>;
  let mockUserMapper: jest.Mocked<UserMapper>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCpf: jest.fn(),
      findByEmail: jest.fn(),
      findByFilter: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as any;
    mockUserValidationService = {
      validateCreateData: jest.fn(),
      validateUpdateData: jest.fn(),
      validateUserExistence: jest.fn(),
      validateDeleteSelfOperation: jest.fn(),
    } as any;
    mockUserMapper = { toResponseUserDto: jest.fn() } as any;
    mockPasswordHasher = { hash: jest.fn() } as any;

    userService = new UserService(
      mockUserRepository,
      mockUserValidationService,
      mockUserMapper,
      mockPasswordHasher,
    );
  });

  describe('createUser', () => {
    it('should create a user and return a DTO', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const savedUser: User = {
        ...createUserDto,
        id: '1',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const responseUserDto: ResponseUserDto = {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        role: UserRole.Admin,
      };

      mockPasswordHasher.hash.mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(savedUser);
      mockUserMapper.toResponseUserDto.mockReturnValue(responseUserDto);

      const result = await userService.createUser(createUserDto);

      expect(mockUserValidationService.validateCreateData).toHaveBeenCalledWith(
        createUserDto,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('Password123!');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(mockUserMapper.toResponseUserDto).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(responseUserDto);
    });
    it('should throw an error when password encryption fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const validationError = new ApplicationError('Validation failed', 400);

      mockUserValidationService.validateCreateData.mockRejectedValue(
        validationError,
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should throw an error when password encryption fails', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const encryptionError = new Error('Error during password encryption');

      mockPasswordHasher.hash.mockRejectedValue(encryptionError);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        Error,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should throw an error when the CPF or email is already registered', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Maria',
        lastName: 'Silva',
        cpf: '987.654.321-98',
        email: 'maria@example.com',
        password: 'Secure123!',
        confirmPassword: 'Secure123!',
        role: UserRole.Admin,
      };

      const uniquenessError = new ApplicationError(
        'CPF or email already exists',
        409,
      );
      mockUserValidationService.validateCreateData.mockRejectedValue(
        uniquenessError,
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should throw an error if password and confirm password do not match', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Alice',
        lastName: 'Wonder',
        cpf: '123.456.789-09',
        email: 'alice@example.com',
        password: 'Password123!',
        confirmPassword: 'Password1234!',
        role: UserRole.Admin,
      };

      const passwordMismatchError = new ApplicationError(
        'Passwords do not match',
        400,
      );
      mockUserValidationService.validateCreateData.mockRejectedValue(
        passwordMismatchError,
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should throw an error when the email is already registered', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Bob',
        lastName: 'Builder',
        cpf: '987.654.321-98',
        email: 'bob@example.com',
        password: 'Builder123!',
        confirmPassword: 'Builder123!',
        role: UserRole.Admin,
      };

      const emailExistsError = new ApplicationError(
        'Email already exists',
        409,
      );
      mockUserValidationService.validateCreateData.mockRejectedValue(
        emailExistsError,
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should throw an error if required fields are missing', async () => {
      const incompleteUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: '',
        cpf: '',
        email: '',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const missingFieldsError = new ApplicationError(
        'Required fields are missing',
        400,
      );
      mockUserValidationService.validateCreateData.mockRejectedValue(
        missingFieldsError,
      );

      await expect(
        userService.createUser(incompleteUserDto as any),
      ).rejects.toThrow(ApplicationError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should handle exceptions thrown by the repository', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const repositoryError = new Error('Database connection error');
      mockUserRepository.create.mockRejectedValue(repositoryError);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        Error,
      );

      expect(mockUserRepository.create).toHaveBeenCalled();
    });
    it('should throw an error if CPF format is invalid', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: 'incorrect_format',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const cpfFormatError = new ApplicationError('CPF format is invalid', 400);
      mockUserValidationService.validateCreateData.mockRejectedValue(
        cpfFormatError,
      );

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    it('should handle edge case values for data fields', async () => {
      const edgeCaseUserDto: CreateUserDto = {
        firstName: 'J'.repeat(51),
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: UserRole.Admin,
      };

      const edgeCaseError = new ApplicationError(
        'Data field values are too long',
        400,
      );
      mockUserValidationService.validateCreateData.mockRejectedValue(
        edgeCaseError,
      );

      await expect(userService.createUser(edgeCaseUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
  describe('updateUser', () => {
    it('should update a user successfully and return a DTO', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      const user: User = {
        id: '1',
        cpf: '123.456.789-09',
        password: 'oldPassword',
        role: UserRole.Admin,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedUser: User = { ...user, password: 'hashedNewPassword' };
      const responseUserDto: ResponseUserDto = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        cpf: '123.456.789-09',
        email: 'alice.johnson@example.com',
        role: UserRole.Admin,
      };

      mockPasswordHasher.hash.mockResolvedValue('hashedNewPassword');
      mockUserRepository.update.mockResolvedValue(updatedUser);
      mockUserMapper.toResponseUserDto.mockReturnValue(responseUserDto);
      mockUserValidationService.validateUpdateData.mockResolvedValue();
      mockUserValidationService.validateUserExistence.mockResolvedValue();

      const result = await userService.updateUser('1', updateUserDto);

      expect(mockUserValidationService.validateUpdateData).toHaveBeenCalledWith(
        '1',
        updateUserDto,
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
        ...updateUserDto,
        password: 'hashedNewPassword',
      });
      expect(mockUserMapper.toResponseUserDto).toHaveBeenCalledWith(
        updatedUser,
      );
      expect(result).toEqual(responseUserDto);
    });
    it('should throw an error if update data validation fails', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'invalid-email',
      };
      const validationError = new ApplicationError('Validation failed', 400);
      mockUserValidationService.validateUpdateData.mockRejectedValue(
        validationError,
      );

      await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
    it('should throw an error if no user is found with the provided ID', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Alice' };

      mockUserValidationService.validateUserExistence.mockRejectedValue(
        new ApplicationError('User not found', 404),
      );

      await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if password encryption fails', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'NewSecure123!',
        confirmPassword: 'NewSecure123!',
      };
      const encryptionError = new Error('Encryption failed');
      mockPasswordHasher.hash.mockRejectedValue(encryptionError);

      await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
        Error,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
  it('should update a user without changing the password if no new password is provided', async () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Alice',
      lastName: 'Johnson',
    };
    const user: User = {
      id: '1',
      cpf: '123.456.789-09',
      password: 'oldPassword',
      role: UserRole.Admin,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedUser: User = {
      ...user,
      firstName: 'Alice',
      lastName: 'Johnson',
    };
    mockUserRepository.update.mockResolvedValue(updatedUser);
    mockUserMapper.toResponseUserDto.mockReturnValue(
      updatedUser as ResponseUserDto,
    );
    mockUserValidationService.validateUpdateData.mockResolvedValue();
    mockUserValidationService.validateUserExistence.mockResolvedValue();

    const result = await userService.updateUser('1', updateUserDto);

    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith('1', updateUserDto);
    expect(result).toEqual(updatedUser as ResponseUserDto);
  });
  it('should throw an error if the updated email or CPF is already in use', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'existing@example.com',
    };
    const uniquenessError = new ApplicationError(
      'Email or CPF already in use',
      409,
    );
    mockUserValidationService.validateUpdateData.mockRejectedValue(
      uniquenessError,
    );

    await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
      ApplicationError,
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
  it('should throw an error if the email or CPF format is invalid', async () => {
    const updateUserDto: UpdateUserDto = {
      email: 'invalid-email-format',
      cpf: '12345678900',
    };
    const formatError = new ApplicationError(
      'Invalid email or CPF format',
      400,
    );
    mockUserValidationService.validateUpdateData.mockRejectedValue(formatError);

    await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
      ApplicationError,
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
  it('should throw an error if user tries to change role without permission', async () => {
    const updateUserDto: UpdateUserDto = {
      role: UserRole.Deliveryman,
    };
    const roleChangeError = new ApplicationError(
      'Unauthorized role change',
      403,
    );
    mockUserValidationService.validateUpdateData.mockRejectedValue(
      roleChangeError,
    );

    await expect(userService.updateUser('1', updateUserDto)).rejects.toThrow(
      ApplicationError,
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const userIdToDelete = '2';
      const loggedInUserId = '1';

      mockUserValidationService.validateUserExistence.mockResolvedValue();
      mockUserValidationService.validateDeleteSelfOperation.mockResolvedValue();
      mockUserRepository.remove.mockResolvedValue();

      await userService.deleteUser(userIdToDelete, loggedInUserId);

      expect(
        mockUserValidationService.validateUserExistence,
      ).toHaveBeenCalledWith(userIdToDelete);
      expect(
        mockUserValidationService.validateDeleteSelfOperation,
      ).toHaveBeenCalledWith(userIdToDelete, loggedInUserId);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(userIdToDelete);
    });

    it('should throw an error if a user tries to delete their own account', async () => {
      const userIdToDelete = '1';
      const loggedInUserId = '1';

      const forbiddenError = new ApplicationError(
        'Forbidden operation',
        403,
        true,
        [{ key: 'deleteSelf', value: 'You cannot delete your own account.' }],
      );
      mockUserValidationService.validateDeleteSelfOperation.mockRejectedValue(
        forbiddenError,
      );

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).rejects.toThrow(ApplicationError);

      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw an error if the user does not exist', async () => {
      const userIdToDelete = '3';
      const loggedInUserId = '1';
      const notFoundError = new ApplicationError('User not found', 404);
      mockUserValidationService.validateUserExistence.mockRejectedValue(
        notFoundError,
      );

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).rejects.toThrow(ApplicationError);

      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });
    it('should throw an error if the user ID to delete is invalid', async () => {
      const userIdToDelete = 'invalid-id';
      const loggedInUserId = '1';
      const invalidIdError = new ApplicationError('Invalid user ID', 400);
      mockUserValidationService.validateUserExistence.mockRejectedValue(
        invalidIdError,
      );

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).rejects.toThrow(ApplicationError);

      expect(mockUserRepository.remove).not.toHaveBeenCalled();
    });
    it('should throw an error if the user has active dependencies', async () => {
      const userIdToDelete = '2';
      const loggedInUserId = '1';
      const dependencyError = new ApplicationError(
        'User has active dependencies',
        403,
      );
      mockUserRepository.remove.mockRejectedValue(dependencyError);

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).rejects.toThrow(ApplicationError);

      expect(mockUserRepository.remove).toHaveBeenCalledWith(userIdToDelete);
    });
    it('should handle concurrent delete attempts gracefully', async () => {
      const userIdToDelete = '2';
      const loggedInUserId = '1';
      mockUserValidationService.validateUserExistence.mockResolvedValue();
      mockUserValidationService.validateDeleteSelfOperation.mockResolvedValue();
      const concurrentError = new ApplicationError(
        'Concurrent modification error',
        409,
      );
      mockUserRepository.remove
        .mockRejectedValueOnce(concurrentError)
        .mockResolvedValueOnce();

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).rejects.toThrow(ApplicationError);

      await expect(
        userService.deleteUser(userIdToDelete, loggedInUserId),
      ).resolves.toBeUndefined();

      expect(mockUserRepository.remove).toHaveBeenCalledTimes(2);
    });
  });
  describe('findUserById', () => {
    it('should return a ResponseUserDto when a user is found', async () => {
      const user: User = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        cpf: '123.456.789-09',
        role: UserRole.Admin,
        password: 'securePassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const responseUserDto: ResponseUserDto = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        role: UserRole.Admin,
        cpf: '123.456.789-09',
      };

      mockUserRepository.findById.mockResolvedValue(user);
      mockUserMapper.toResponseUserDto.mockReturnValue(responseUserDto);

      const result = await userService.findUserById('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(responseUserDto);
    });

    it('should return undefined if no user is found', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      const result = await userService.findUserById('2');

      expect(result).toBeUndefined();
    });

    it('should throw an error if user validation fails', async () => {
      const validationError = new ApplicationError('User not found', 404);
      mockUserValidationService.validateUserExistence.mockRejectedValue(
        validationError,
      );

      await expect(userService.findUserById('3')).rejects.toThrow(
        ApplicationError,
      );

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
  describe('listUsers', () => {
    it('should return all users when no role is specified', async () => {
      const users: User[] = [
        { id: '1', firstName: 'Alice', role: UserRole.Admin } as User,
        { id: '2', firstName: 'Bob', role: UserRole.Deliveryman } as User,
      ];
      const responseUsersDto: ResponseUserDto[] = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
      }));

      mockUserRepository.findAll.mockResolvedValue(users);
      mockUserMapper.toResponseUserDto.mockImplementation((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
      }));

      const result = await userService.listUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(responseUsersDto);
    });

    it('should return only users with a specified valid role', async () => {
      const role = UserRole.Admin;
      const users: User[] = [
        {
          id: '1',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          cpf: '123.456.789-09',
          password: 'securePassword',
          role: UserRole.Admin,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const responseUsersDto: ResponseUserDto[] = users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
      }));

      mockUserRepository.findByFilter.mockResolvedValue(users);
      mockUserMapper.toResponseUserDto.mockImplementation((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cpf: user.cpf,
        role: user.role,
      }));

      const result = await userService.listUsers(role);

      expect(mockUserRepository.findByFilter).toHaveBeenCalledWith({
        role: UserRole.Admin,
      });
      expect(result).toEqual(responseUsersDto);
    });

    it('should return an empty array when an invalid role is provided', async () => {
      const invalidRole = 'nonexistent-role';
      const users: User[] = [];

      mockUserRepository.findByFilter.mockResolvedValue(users);

      const result = await userService.listUsers(invalidRole);

      expect(mockUserRepository.findByFilter).toHaveBeenCalledWith({
        role: undefined,
      });
      expect(result).toEqual([]);
    });
  });
  describe('validateUser', () => {
    it('should return a ResponseUserDto when credentials are valid', async () => {
      const user: User = {
        id: '1',
        cpf: '123.456.789-09',
        password: 'hashedPassword',
        role: UserRole.Admin,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const responseUserDto: ResponseUserDto = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        role: UserRole.Admin,
        cpf: '123.456.789-09',
      };

      mockUserRepository.findByCpf.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      mockUserMapper.toResponseUserDto.mockReturnValue(responseUserDto);

      const result = await userService.validateUser(
        '123.456.789-09',
        'validPassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'validPassword',
        'hashedPassword',
      );
      expect(result).toEqual(responseUserDto);
    });

    it('should return null if no user is found for the provided CPF', async () => {
      mockUserRepository.findByCpf.mockResolvedValue(undefined);

      const result = await userService.validateUser(
        '123.456.789-09',
        'anyPassword',
      );

      expect(result).toBeNull();
    });

    it('should return null if the password does not match', async () => {
      const user: User = {
        id: '1',
        cpf: '123.456.789-09',
        password: 'hashedPassword',
        role: UserRole.Admin,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findByCpf.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const result = await userService.validateUser(
        '123.456.789-09',
        'wrongPassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
      expect(result).toBeNull();
    });
  });
});
