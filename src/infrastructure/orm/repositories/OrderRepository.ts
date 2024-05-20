import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../../domain/entities/Order';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderFilter } from '../../../domain/interface/OrderFilter';

@injectable()
export class OrderRepository implements IOrderRepository {
  private ormRepository: Repository<Order>;

  constructor(@inject('DataSource') private dataSource: DataSource) {
    this.ormRepository = this.dataSource.getRepository(Order);
  }

  public async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ormRepository.create(orderData);
    return this.ormRepository.save(order);
  }

  public async update(id: string, orderData: Partial<Order>): Promise<Order> {
    const order = await this.ormRepository.findOneBy({ id });
    if (!order) {
      throw new Error('Order not found');
    }
    Object.assign(order, orderData);
    return this.ormRepository.save(order);
  }

  public async find(): Promise<Order[]> {
    return this.ormRepository.find({
      relations: ['recipient', 'deliveryman'],
    });
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne({
      where: { id },
      relations: ['recipient', 'deliveryman'],
    });
    return order ?? undefined;
  }

  public async findByFilter(filter: OrderFilter): Promise<Order[]> {
    const query = this.ormRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.recipient', 'recipient')
      .leftJoinAndSelect('order.deliveryman', 'deliveryman');

    if (filter.deliverymanId) {
      query.andWhere('deliveryman.id = :deliverymanId', {
        deliverymanId: filter.deliverymanId,
      });
    }

    if (filter.status) {
      query.andWhere('order.status = :status', { status: filter.status });
    }

    return await query.getMany();
  }

  public async save(order: Order): Promise<Order> {
    return this.ormRepository.save(order);
  }

  public async remove(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
