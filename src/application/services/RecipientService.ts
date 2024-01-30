import { injectable, inject } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { Recipient } from '../../domain/entities/Recipient';

@injectable()
export class RecipientService {
  constructor(
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
  ) {}

  public async createRecipient(
    recipientData: Partial<Recipient>,
  ): Promise<Recipient> {
    const newRecipient = await this.recipientRepository.create(recipientData);
    return this.recipientRepository.save(newRecipient);
  }

  public async updateRecipient(
    id: string,
    recipientData: Partial<Recipient>,
  ): Promise<Recipient> {
    const recipient = await this.recipientRepository.findById(id);
    if (!recipient) {
      throw new Error('Recipient not found');
    }
    Object.assign(recipient, recipientData);
    return this.recipientRepository.save(recipient);
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
}
