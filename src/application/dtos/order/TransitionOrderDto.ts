import { OrderStatus } from '../../../domain/enums/OrderStatus';
import { UserRole } from '../../../domain/enums/UserRole';
export interface TransitionOrderDto {
  orderId: string;
  deliverymanId: string;
  userRole: UserRole;
  nextStatus: OrderStatus;
}
