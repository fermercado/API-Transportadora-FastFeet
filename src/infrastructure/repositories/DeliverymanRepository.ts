import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Deliveryman } from '../../domain/entities/Deliveryman';
import { IDeliverymanRepository } from '../../domain/repositories/IDeliverymanRepository';

@injectable()
export class DeliverymanRepository implements IDeliverymanRepository {
  private ormRepository: Repository<Deliveryman>;

  constructor(@inject('DataSource') dataSource: DataSource) {
    this.ormRepository = dataSource.getRepository(Deliveryman);
  }

  public async create(
    deliverymanData: Partial<Deliveryman>,
  ): Promise<Deliveryman> {
    const deliveryman = this.ormRepository.create(deliverymanData);
    return this.ormRepository.save(deliveryman);
  }

  public async find(): Promise<Deliveryman[]> {
    return this.ormRepository.find();
  }

  public async findById(id: string): Promise<Deliveryman | undefined> {
    const deliveryman = await this.ormRepository.findOneBy({ id });
    return deliveryman ?? undefined;
  }

  public async findByCpf(cpf: string): Promise<Deliveryman | undefined> {
    const deliveryman = await this.ormRepository.findOneBy({ cpf });
    return deliveryman ?? undefined;
  }

  public async save(deliveryman: Deliveryman): Promise<Deliveryman> {
    return this.ormRepository.save(deliveryman);
  }

  public async remove(deliveryman: Deliveryman): Promise<void> {
    await this.ormRepository.remove(deliveryman);
  }
}
