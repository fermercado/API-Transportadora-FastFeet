import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

@injectable()
export class OrderRepository implements IOrderRepository {
  private ormRepository: Repository<Order>;

  constructor(@inject('DataSource') dataSource: DataSource) {
    this.ormRepository = dataSource.getRepository(Order);
  }

  public async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ormRepository.create(orderData);
    return this.ormRepository.save(order);
  }

  public async find(): Promise<Order[]> {
    return this.ormRepository.find();
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOneBy({ id });
    return order ?? undefined;
  }

  public async findByTrackingCode(
    trackingCode: string,
  ): Promise<Order | undefined> {
    const order = await this.ormRepository.findOneBy({ trackingCode });
    return order ?? undefined;
  }

  public async save(order: Order): Promise<Order> {
    return this.ormRepository.save(order);
  }

  public async remove(order: Order): Promise<void> {
    await this.ormRepository.remove(order);
  }
}
