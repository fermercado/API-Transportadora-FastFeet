import { Order } from '../../domain/entities/Order';

export interface IOrderRepository {
  create(orderData: Partial<Order>): Promise<Order>;
  update(id: string, orderData: Partial<Order>): Promise<Order>;
  find(): Promise<Order[]>;
  findById(id: string): Promise<Order | undefined>;
  findByDeliveryman(deliverymanId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  remove(id: string): Promise<void>;
}
