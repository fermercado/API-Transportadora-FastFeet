import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Recipient } from '../../../domain/entities/Recipient';
import { IRecipientRepository } from '../../../domain/repositories/IRecipientRepository';

@injectable()
export class RecipientRepository implements IRecipientRepository {
  private ormRepository: Repository<Recipient>;

  constructor(@inject('DataSource') private dataSource: DataSource) {
    this.ormRepository = this.dataSource.getRepository(Recipient);
  }

  public async findByEmail(email: string): Promise<Recipient | undefined> {
    const recipient = await this.ormRepository.findOneBy({ email });
    return recipient ?? undefined;
  }

  public async findByCpf(cpf: string): Promise<Recipient | undefined> {
    const recipient = await this.ormRepository.findOneBy({ cpf });
    return recipient ?? undefined;
  }

  public async find(): Promise<Recipient[]> {
    return this.ormRepository.find();
  }

  public async create(recipientData: Partial<Recipient>): Promise<Recipient> {
    const recipient = this.ormRepository.create(recipientData);
    return this.ormRepository.save(recipient);
  }

  public async findById(id: string): Promise<Recipient | undefined> {
    const recipient = await this.ormRepository.findOneBy({ id });
    return recipient ?? undefined;
  }

  public async findByZipCode(zipCode: string): Promise<Recipient | undefined> {
    const recipient = await this.ormRepository.findOneBy({ zipCode });
    return recipient ?? undefined;
  }

  public async save(recipient: Recipient): Promise<Recipient> {
    return this.ormRepository.save(recipient);
  }

  public async remove(recipient: Recipient): Promise<void> {
    await this.ormRepository.remove(recipient);
  }

  public async update(
    id: string,
    recipientData: Partial<Recipient>,
  ): Promise<Recipient> {
    let recipient = await this.ormRepository.findOneBy({ id });
    if (!recipient) {
      throw new Error(`Recipient with id ${id} not found`);
    }
    recipient = this.ormRepository.merge(recipient, recipientData);
    return this.ormRepository.save(recipient);
  }
}
