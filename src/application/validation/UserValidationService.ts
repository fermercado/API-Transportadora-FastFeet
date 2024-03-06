import { IUserRepository } from '../../domain/repositories/IUserRepository';
import UserValidator from '../../domain/validators/UserValidator';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { inject, injectable } from 'tsyringe';

@injectable()
class UserValidationService {
  validateUserExistence(id: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
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
      throw new ApplicationError(
        'Validation failed',
        400,
        true,
        validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'general',
          message: issue.message,
        })),
      );
    }

    if (userData.password !== userData.confirmPassword) {
      throw new ApplicationError('Validation failed', 400, true, [
        { field: 'confirmPassword', message: "Passwords don't match" },
      ]);
    }

    await this.validateCpfAndEmailUniqueness(userData.cpf, userData.email);
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
      throw new ApplicationError(
        'Validation failed',
        400,
        true,
        validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'general',
          message: issue.message,
        })),
      );
    }

    if (
      userData.password &&
      userData.confirmPassword &&
      userData.password !== userData.confirmPassword
    ) {
      throw new ApplicationError('Validation failed', 400, true, [
        { field: 'confirmPassword', message: "Passwords don't match" },
      ]);
    }

    await this.validateCpfAndEmailUniqueness(userData.cpf, userData.email, id);
  }

  private async validateCpfAndEmailUniqueness(
    cpf?: string,
    email?: string,
    userIdToUpdate?: string,
  ): Promise<void> {
    if (cpf) {
      const userByCpf = await this.userRepository.findByCpf(cpf);
      if (userByCpf && userByCpf.id !== userIdToUpdate) {
        throw new ApplicationError(
          'A user with the same CPF already exists.',
          400,
          true,
          [
            {
              field: 'cpf',
              message: 'A user with the same CPF already exists.',
            },
          ],
        );
      }
    }

    if (email) {
      const userByEmail = await this.userRepository.findByEmail(email);
      if (userByEmail && userByEmail.id !== userIdToUpdate) {
        throw new ApplicationError(
          'A user with the same email already exists.',
          400,
          true,
          [
            {
              field: 'email',
              message: 'A user with the same email already exists.',
            },
          ],
        );
      }
    }
  }
}

export default UserValidationService;
