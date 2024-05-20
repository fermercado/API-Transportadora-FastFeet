import { OrderStatus } from '../../domain/enums/OrderStatus';

export interface OrderFilter {
  status?: OrderStatus;
  deliverymanId?: string;
}
