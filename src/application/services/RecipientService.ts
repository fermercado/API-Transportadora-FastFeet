import { injectable, inject } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import { RecipientValidationService } from '../../domain/validation/RecipientValidationService';
import { RecipientMapper } from '../mappers/RecipientMapper';
import { RecipientResponseDto } from '../dtos/recipient/ResponseRecipientDto';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';

@injectable()
export class RecipientService {
  constructor(
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
    @inject('RecipientValidationService')
    private recipientValidationService: RecipientValidationService,
    @inject('RecipientMapper')
    private recipientMapper: RecipientMapper,
  ) {}

  public async createRecipient(
    recipientData: CreateRecipientDto,
  ): Promise<RecipientResponseDto> {
    await this.recipientValidationService.validateCreateData(recipientData);
    await this.recipientValidationService.validateUniqueness(recipientData);

    const newRecipientData = await this.processAddressInfo(recipientData);
    const newRecipient =
      await this.recipientRepository.create(newRecipientData);

    return this.recipientMapper.toDto(newRecipient);
  }

  public async updateRecipient(
    id: string,
    recipientData: UpdateRecipientDto,
  ): Promise<RecipientResponseDto> {
    const existingRecipient = await this.recipientRepository.findById(id);
    if (!existingRecipient) {
      throw new ApplicationError('Recipient not found', 404, true);
    }

    await this.recipientValidationService.validateUpdateData(recipientData, id);
    await this.recipientValidationService.validateUniqueness(recipientData, id);

    const updatedData = await this.processAddressInfo({
      ...existingRecipient,
      ...recipientData,
    });
    Object.assign(existingRecipient, updatedData);

    const updatedRecipient = await this.recipientRepository.update(
      id,
      existingRecipient,
    );

    return this.recipientMapper.toDto(updatedRecipient);
  }

  public async deleteRecipient(id: string): Promise<void> {
    const recipient = await this.recipientRepository.findById(id);
    if (!recipient) {
      throw new ApplicationError('Recipient not found', 404, true);
    }
    await this.recipientRepository.remove(recipient);
  }

  public async findRecipientById(
    id: string,
  ): Promise<RecipientResponseDto | undefined> {
    const recipient = await this.recipientRepository.findById(id);
    if (!recipient) return undefined;
    return this.recipientMapper.toDto(recipient);
  }

  public async listRecipients(): Promise<RecipientResponseDto[]> {
    const recipients = await this.recipientRepository.find();
    return recipients.map((recipient) => this.recipientMapper.toDto(recipient));
  }

  private async processAddressInfo(
    recipientData: CreateRecipientDto | UpdateRecipientDto,
  ): Promise<CreateRecipientDto | UpdateRecipientDto> {
    this.recipientValidationService.validateZipCode(
      recipientData.zipCode as string,
    );

    const addressInfo = await ExternalServices.getAddressByZipCode(
      recipientData.zipCode as string,
    );
    await this.recipientValidationService.validateAddressCompleteness(
      addressInfo,
      recipientData,
    );

    return {
      ...recipientData,
      street: addressInfo.logradouro || recipientData.street,
      neighborhood: addressInfo.bairro || recipientData.neighborhood,
      city: addressInfo.localidade || recipientData.city,
      state: addressInfo.uf || recipientData.state,
      latitude: addressInfo.latitude ?? recipientData.latitude,
      longitude: addressInfo.longitude ?? recipientData.longitude,
    };
  }
}
