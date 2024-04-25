import { OrderStatus } from '../../../domain/enums/OrderStatus';
export interface UpdateOrderDto {
  trackingCode?: string;
  recipientId?: string;
  deliverymanId?: string;
  status?: OrderStatus;
  deliveryPhoto?: string;
}
