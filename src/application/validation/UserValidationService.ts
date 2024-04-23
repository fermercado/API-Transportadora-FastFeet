import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UniqueValidationUtils } from '../../shared/utils/uniqueValidationUtils';
import { UserValidator } from '../../domain/validators/UserValidator';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';
import bcrypt from 'bcrypt';

@injectable()
export class UserValidationService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
  ) {}

  async validateCreationData(userData: {
    cpf: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    const validationResult =
      UserValidator.validateCreateUser.safeParse(userData);
    if (!validationResult.success) {
      const errorDetails: ErrorDetail[] = validationResult.error.issues.map(
        (issue) => ({
          key: issue.path.join('.') || 'general',
          value: issue.message,
        }),
      );
      throw new ApplicationError('Validation failed', 400, true, errorDetails);
    }

    await this.uniqueValidationUtils.checkUniqueEmail(userData.email, 'user');
    await this.uniqueValidationUtils.checkUniqueCpf(userData.cpf, 'user');

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
  }

  async validateUpdateData(
    id: string,
    userData: {
      cpf?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    },
  ) {
    const validationResult =
      UserValidator.validateUpdateUser.safeParse(userData);
    if (!validationResult.success) {
      const errorDetails: ErrorDetail[] = validationResult.error.issues.map(
        (issue) => ({
          key: issue.path.join('.') || 'general',
          value: issue.message,
        }),
      );
      throw new ApplicationError('Validation failed', 400, true, errorDetails);
    }

    if (userData.cpf) {
      await this.uniqueValidationUtils.checkUniqueCpf(userData.cpf, 'user', id);
    }
    if (userData.email) {
      await this.uniqueValidationUtils.checkUniqueEmail(
        userData.email,
        'user',
        id,
      );
    }

    if (
      userData.password &&
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    ) {
      const passwordMismatchError: ErrorDetail[] = [
        {
          key: 'confirmPassword',
          value: "Passwords don't match",
        },
      ];
      throw new ApplicationError(
        'Validation failed',
        400,
        true,
        passwordMismatchError,
      );
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
  }

  async validateUserExistence(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const notFoundError: ErrorDetail = {
        key: 'id',
        value: 'No user found with the provided ID.',
      };
      throw new ApplicationError('User not found', 404, true, [notFoundError]);
    }
  }
}
