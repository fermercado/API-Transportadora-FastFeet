import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserValidator } from '../../domain/validators/UserValidator';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { inject, injectable } from 'tsyringe';
import bcrypt from 'bcrypt';

@injectable()
export class UserValidationService {
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
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
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

    if (userData.password) {
      if (
        userData.confirmPassword &&
        userData.password !== userData.confirmPassword
      ) {
        throw new ApplicationError('Validation failed', 400, true, [
          { field: 'confirmPassword', message: "Passwords don't match" },
        ]);
      }
      userData.password = await bcrypt.hash(userData.password, 10);
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

  async validateUserExistence(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ApplicationError('User not found', 404, true, [
        { field: 'id', message: 'No user found with the provided ID.' },
      ]);
    }
  }
}

export default UserValidationService;
