import { injectable, inject } from 'tsyringe';
import { RecipientValidator } from '../../domain/validators/RecipientValidator';
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import { UniqueValidationUtils } from '../../infrastructure/shared/utils/uniqueValidationUtils';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';

@injectable()
export class RecipientValidationService {
  constructor(
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
  ) {}

  public async validateCreateData(data: CreateRecipientDto): Promise<void> {
    const result = await RecipientValidator.createSchema.safeParseAsync(data);
    if (!result.success) {
      const errors: ErrorDetail[] = result.error.issues.map((issue) => ({
        key: issue.path.join('.'),
        value: issue.message,
      }));
      throw new ApplicationError('Validation error', 400, true, errors);
    }

    await this.validateUniqueness(data);
  }

  public async validateUpdateData(
    data: UpdateRecipientDto,
    recipientId: string,
  ): Promise<void> {
    const result = await RecipientValidator.updateSchema
      .partial()
      .safeParseAsync(data);
    if (!result.success) {
      const errors: ErrorDetail[] = result.error.issues.map((issue) => ({
        key: issue.path.join('.'),
        value: issue.message,
      }));
      throw new ApplicationError('Validation error', 400, true, errors);
    }

    await this.validateUniqueness(data, recipientId);
  }

  public async validateUniqueness(
    recipientData: CreateRecipientDto | UpdateRecipientDto,
    id?: string,
  ): Promise<void> {
    if (recipientData.email) {
      await this.uniqueValidationUtils.checkUniqueEmail(
        recipientData.email,
        'recipient',
        id,
      );
    }
    if (recipientData.cpf) {
      await this.uniqueValidationUtils.checkUniqueCpf(
        recipientData.cpf,
        'recipient',
        id,
      );
    }
  }
}
