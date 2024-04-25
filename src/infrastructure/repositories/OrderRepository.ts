import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';

@injectable()
export class OrderRepository implements IOrderRepository {
  private ormRepository: Repository<Order>;

  constructor(@inject('DataSource') private dataSource: DataSource) {
    this.ormRepository = this.dataSource.getRepository(Order);
  }

  public async create(orderData: Partial<Order>): Promise<Order> {
    try {
      const order = this.ormRepository.create(orderData);
      const savedOrder = await this.ormRepository.save(order);
      return savedOrder;
    } catch (error) {
      throw error;
    }
  }

  public async update(id: string, orderData: Partial<Order>): Promise<Order> {
    let order = await this.ormRepository.findOneBy({ id });
    if (!order) {
      throw new Error('Order not found');
    }
    Object.assign(order, orderData);
    return this.ormRepository.save(order);
  }

  public async find(): Promise<Order[]> {
    return this.ormRepository.find();
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne({
      where: { id },
      relations: ['recipient', 'deliveryman'],
    });
    return order ?? undefined;
  }

  public async findByDeliveryman(deliverymanId: string): Promise<Order[]> {
    return this.ormRepository.find({
      where: { deliveryman: { id: deliverymanId } },
      relations: ['recipient', 'deliveryman'],
    });
  }

  public async save(order: Order): Promise<Order> {
    return this.ormRepository.save(order);
  }

  public async remove(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
