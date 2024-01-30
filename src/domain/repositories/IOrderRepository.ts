import { Order } from '../entities/Order';

export interface IOrderRepository {
  create(orderData: Partial<Order>): Promise<Order>;
  save(order: Order): Promise<Order>;
  remove(order: Order): Promise<void>;
  findById(id: string): Promise<Order | undefined>;
  find(): Promise<Order[]>;
}
