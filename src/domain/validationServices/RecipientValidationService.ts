import { injectable, inject } from 'tsyringe';
import { RecipientValidator } from '../validators/RecipientValidator';
import { CreateRecipientDto } from '../../application/dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../../application/dtos/recipient/UpdateRecipientDto';
import { UniqueValidationUtils } from '../../infrastructure/shared/utils/uniqueValidationUtils';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

@injectable()
export class RecipientValidationService {
  constructor(
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
    @inject('CepValidationProvider')
    private cepValidationProvider: CepValidationProvider,
  ) {}

  public async validateCreateData(data: CreateRecipientDto): Promise<void> {
    const result = await RecipientValidator.createSchema(
      this.cepValidationProvider,
    ).safeParseAsync(data);
    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
        .join(', ');
      throw new ApplicationError(
        `Validation error: ${errorMessage}`,
        400,
        true,
      );
    }

    await this.validateUniqueness(data);
  }

  public async validateUpdateData(
    data: UpdateRecipientDto,
    recipientId: string,
  ): Promise<void> {
    const result = await RecipientValidator.updateSchema(
      this.cepValidationProvider,
    )
      .strict()
      .safeParseAsync(data);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
        .join(', ');
      throw new ApplicationError(
        `Validation error: ${errorMessage}`,
        400,
        true,
      );
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

  public async validateZipCode(zipCode: string): Promise<void> {
    if (!zipCode) {
      throw new ApplicationError('Zip code is required', 400, true);
    }
  }

  public async validateAddressCompleteness(
    addressInfo: any,
    recipientData: CreateRecipientDto | UpdateRecipientDto,
  ): Promise<void> {
    const missingFields = [];
    if (!addressInfo.logradouro && !recipientData.street)
      missingFields.push('street');
    if (!addressInfo.bairro && !recipientData.neighborhood)
      missingFields.push('neighborhood');
    if (!addressInfo.localidade && !recipientData.city)
      missingFields.push('city');
    if (!addressInfo.uf && !recipientData.state) missingFields.push('state');

    if (missingFields.length > 0) {
      throw new ApplicationError(
        `Some address information was not found. Please complete the following data: ${missingFields.join(', ')}.`,
        400,
        true,
      );
    }
  }
}
