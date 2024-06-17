import { OrderStatus } from '../../../domain/enums/OrderStatus';
export interface FindDeliveriesForDelivererDto {
  deliverymanId: string;
  status?: OrderStatus;
}
