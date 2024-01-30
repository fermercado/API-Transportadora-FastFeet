import { Recipient } from '../entities/Recipient';

export interface IRecipientRepository {
  create(recipientData: Partial<Recipient>): Promise<Recipient>;
  save(recipient: Recipient): Promise<Recipient>;
  remove(recipient: Recipient): Promise<void>;
  findById(id: string): Promise<Recipient | undefined>;
  findByZipCode(zipCode: string): Promise<Recipient | undefined>;
  find(): Promise<Recipient[]>;
}
