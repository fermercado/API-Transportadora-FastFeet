import { injectable, inject } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { Recipient } from '../../domain/entities/Recipient';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import { RecipientValidationService } from '../validation/RecipientValidationService';
import UniqueValidationUtils from '../../shared/utils/uniqueValidationUtils';

@injectable()
export class RecipientService {
  constructor(
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
    @inject('ExternalServices')
    private externalServices: ExternalServices,
    @inject('RecipientValidationService')
    private recipientValidationService: RecipientValidationService,
    @inject('UniqueValidationUtils')
    private uniqueValidationUtils: UniqueValidationUtils,
  ) {}

  public async createRecipient(
    recipientData: CreateRecipientDto,
  ): Promise<Recipient> {
    await this.uniqueValidationUtils.checkUniqueRecipientCpf(recipientData.cpf);
    await this.uniqueValidationUtils.checkUniqueRecipientEmail(
      recipientData.email,
    );

    const addressInfo = await ExternalServices.getAddressByZipCode(
      recipientData.zipCode,
    );

    const newRecipientData: Partial<Recipient> = {
      ...recipientData,
      street: addressInfo.logradouro || recipientData.street,
      neighborhood: addressInfo.bairro || recipientData.neighborhood,
      city: addressInfo.localidade || recipientData.city,
      state: addressInfo.uf || recipientData.state,
    };

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

    if (
      recipientData.zipCode &&
      recipientData.zipCode !== existingRecipient.zipCode
    ) {
      const addressInfo = await ExternalServices.getAddressByZipCode(
        recipientData.zipCode,
      );

      recipientData.street = addressInfo.logradouro || recipientData.street;
      recipientData.neighborhood =
        addressInfo.bairro || recipientData.neighborhood;
      recipientData.city = addressInfo.localidade || recipientData.city;
      recipientData.state = addressInfo.uf || recipientData.state;
    }
    if (
      recipientData.email &&
      recipientData.email !== existingRecipient.email
    ) {
      await this.uniqueValidationUtils.checkUniqueRecipientEmail(
        recipientData.email,
        existingRecipient.id,
      );
    }

    if (recipientData.cpf && recipientData.cpf !== existingRecipient.cpf) {
      await this.uniqueValidationUtils.checkUniqueRecipientCpf(
        recipientData.cpf,
        existingRecipient.id,
      );
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
    return this.recipientRepository.findAll();
  }
}
