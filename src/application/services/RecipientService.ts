import { injectable, inject } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { Recipient } from '../../domain/entities/Recipient';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import { RecipientValidationService } from '../validation/RecipientValidationService';

@injectable()
export class RecipientService {
  constructor(
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
    @inject('RecipientValidationService')
    private recipientValidationService: RecipientValidationService,
  ) {}

  public async createRecipient(
    recipientData: CreateRecipientDto,
  ): Promise<Recipient> {
    await this.recipientValidationService.validateCreateData(recipientData);
    await this.recipientValidationService.validateUniqueness(recipientData);

    const newRecipientData = await this.processAddressInfo(recipientData);
    const newRecipient =
      await this.recipientRepository.create(newRecipientData);
    return newRecipient;
  }

  public async updateRecipient(
    id: string,
    recipientData: UpdateRecipientDto,
  ): Promise<Recipient> {
    const existingRecipient = await this.recipientRepository.findById(id);
    if (!existingRecipient) {
      throw new Error('Recipient not found');
    }

    await this.recipientValidationService.validateUpdateData(recipientData, id);
    await this.recipientValidationService.validateUniqueness(recipientData, id);

    if (
      recipientData.zipCode &&
      recipientData.zipCode !== existingRecipient.zipCode
    ) {
      const addressData = await this.processAddressInfo(recipientData);
      Object.assign(recipientData, addressData);
    }

    const updatedRecipient = await this.recipientRepository.update(
      id,
      recipientData,
    );
    return updatedRecipient;
  }

  public async deleteRecipient(id: string): Promise<void> {
    const recipient = await this.recipientRepository.findById(id);
    if (!recipient) {
      throw new Error('Recipient not found');
    }
    await this.recipientRepository.remove(recipient);
  }

  public async findRecipientById(id: string): Promise<Recipient | undefined> {
    return this.recipientRepository.findById(id);
  }

  public async listRecipients(): Promise<Recipient[]> {
    return this.recipientRepository.find();
  }

  private async processAddressInfo(
    recipientData: CreateRecipientDto | UpdateRecipientDto,
  ): Promise<CreateRecipientDto | UpdateRecipientDto> {
    const zipCode = recipientData.zipCode;
    if (!zipCode) {
      throw new Error('Zip code is required');
    }

    const addressInfo = await ExternalServices.getAddressByZipCode(zipCode);
    let missingFields = [];

    if (!addressInfo.logradouro && !recipientData.street)
      missingFields.push('street');
    if (!addressInfo.bairro && !recipientData.neighborhood)
      missingFields.push('neighborhood');
    if (!addressInfo.localidade && !recipientData.city)
      missingFields.push('city');
    if (!addressInfo.uf && !recipientData.state) missingFields.push('state');

    if (missingFields.length > 0) {
      throw new Error(
        `Some address information was not found. Please complete the following data: ${missingFields.join(', ')}.`,
      );
    }

    return {
      ...recipientData,
      street: addressInfo.logradouro || recipientData.street,
      neighborhood: addressInfo.bairro || recipientData.neighborhood,
      city: addressInfo.localidade || recipientData.city,
      state: addressInfo.uf || recipientData.state,
      latitude: addressInfo.latitude || recipientData.latitude,
      longitude: addressInfo.longitude || recipientData.longitude,
    };
  }
}
