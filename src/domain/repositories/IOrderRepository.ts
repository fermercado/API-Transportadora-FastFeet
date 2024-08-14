import { Order } from '../../domain/entities/Order';
import { OrderFilter } from '../../domain/interface/OrderFilter';

export interface IOrderRepository {
  create(orderData: Partial<Order>): Promise<Order>;
  update(id: string, orderData: Partial<Order>): Promise<Order>;
  find(): Promise<Order[]>;
  findById(id: string): Promise<Order | undefined>;
  findByFilter(filter: OrderFilter): Promise<Order[]>;
  findByTrackingCode(trackingCode: string): Promise<Order | null>;
  save(order: Order): Promise<Order>;
  remove(id: string): Promise<void>;
}
