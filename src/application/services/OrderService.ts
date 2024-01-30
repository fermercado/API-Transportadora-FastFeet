import { injectable, inject } from 'tsyringe';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

@injectable()
export class OrderService {
  constructor(
    @inject('IOrderRepository') private orderRepository: IOrderRepository,
  ) {}

  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder = this.orderRepository.create(orderData);
    return this.orderRepository.save(await newOrder);
  }

  public async updateOrder(
    id: string,
    orderData: Partial<Order>,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    Object.assign(order, orderData);
    return this.orderRepository.save(order);
  }

  public async deleteOrder(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    await this.orderRepository.remove(order);
  }

  public async findOrderById(id: string): Promise<Order | undefined> {
    return this.orderRepository.findById(id);
  }

  public async listOrders(): Promise<Order[]> {
    return this.orderRepository.find();
  }
}
