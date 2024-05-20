import { injectable, inject } from 'tsyringe';
import { Order } from '../../domain/entities/Order';
import { DeliveryNotificationService } from './DeliveryNotificationService';

@injectable()
export class NotificationService {
  constructor(
    @inject('DeliveryNotificationService')
    private deliveryNotificationService: DeliveryNotificationService,
  ) {}

  public async notifyStatusChange(order: Order) {
    if (!order.recipient.email) return;
    try {
      await this.deliveryNotificationService.sendStatusUpdateEmail(
        order.recipient.email,
        order.recipient.firstName,
        order.status,
      );
    } catch (error) {
      console.error('Failed to send status notification:', error);
      throw error;
    }
  }
}
