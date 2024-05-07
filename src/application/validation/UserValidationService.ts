import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserValidator } from '../../domain/validators/UserValidator';
import { CreateUserDto } from '../dtos/user/CreateUserDto';
import { UpdateUserDto } from '../dtos/user/UpdateUserDto';
import { UniqueValidationUtils } from '../../infrastructure/shared/utils/uniqueValidationUtils';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { ZodIssue } from 'zod';
import { ErrorDetail } from '../../@types/error-types';

@injectable()
export class UserValidationService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
  ) {}

  public async validateCreateData(userData: CreateUserDto): Promise<void> {
    const result =
      await UserValidator.createBaseSchema().safeParseAsync(userData);
    if (!result.success) {
      const errors: ErrorDetail[] = result.error.issues.map(
        (issue: ZodIssue) => ({
          key: issue.path.join('.'),
          value: issue.message,
        }),
      );
      throw new ApplicationError('Validation failed', 400, true, errors);
    }
    await this.validateUniqueness(userData);
  }

  public async validateUpdateData(
    id: string,
    userData: UpdateUserDto,
  ): Promise<void> {
    const updateSchema = UserValidator.createBaseSchema().partial();
    const result = await updateSchema.safeParseAsync(userData);
    if (!result.success) {
      const errors: ErrorDetail[] = result.error.issues.map(
        (issue: ZodIssue) => ({
          key: issue.path.join('.'),
          value: issue.message,
        }),
      );
      throw new ApplicationError('Validation failed', 400, true, errors);
    }
    await this.validateUniqueness(userData, id);
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

  private async validateUniqueness(
    userData: CreateUserDto | UpdateUserDto,
    id?: string,
  ): Promise<void> {
    if (userData.email) {
      await this.uniqueValidationUtils.checkUniqueEmail(
        userData.email,
        'user',
        id,
      );
    }
    if (userData.cpf) {
      await this.uniqueValidationUtils.checkUniqueCpf(userData.cpf, 'user', id);
    }
  }

  public async validateDeleteSelfOperation(
    userIdToDelete: string,
    loggedInUserId: string,
  ): Promise<void> {
    if (userIdToDelete === loggedInUserId) {
      const details: ErrorDetail[] = [
        { key: 'deleteSelf', value: 'You cannot delete your own account.' },
      ];
      throw new ApplicationError('Forbidden operation', 403, true, details);
    }
  }
}
