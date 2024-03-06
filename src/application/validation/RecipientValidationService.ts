import { injectable, inject } from 'tsyringe';
import { RecipientValidator } from '../../domain/validators/RecipientValidator'; // Ajuste o caminho conforme necessário
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import UniqueValidationUtils from '../../shared/utils/uniqueValidationUtils'; // Ajuste o caminho conforme necessário

@injectable()
export class RecipientValidationService {
  constructor(
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
  ) {}

  public async validateCreateData(data: CreateRecipientDto): Promise<void> {
    const result = await RecipientValidator.createSchema.safeParseAsync(data);
    if (!result.success) {
      const errors = result.error.issues
        .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
        .join(', ');
      throw new Error(`Validation error: ${errors}`);
    }

    await this.uniqueValidationUtils.checkUniqueRecipientEmail(
      data.email,
      data.cpf,
    );
  }

  public async validateUpdateData(data: UpdateRecipientDto): Promise<void> {
    const result = await RecipientValidator.updateSchema.safeParseAsync(data);
    if (!result.success) {
      const errors = result.error.issues
        .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
        .join(', ');
      throw new Error(`Validation error: ${errors}`);
    }

    if (data.email && data.cpf) {
      await this.uniqueValidationUtils.checkUniqueRecipientEmail(
        data.email,
        data.cpf,
      );
    }
  }
}
