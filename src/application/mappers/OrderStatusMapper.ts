import { Order } from '../../domain/entities/Order';
import { translateStatus } from '../../infrastructure/shared/utils/translateStatus';
import { DateUtils } from '../../infrastructure/shared/utils/dateUtils';
import { OrderStatus } from '../../domain/enums/OrderStatus';

export class OrderStatusMapper {
  static toDto(order: Order): {
    trackingCode: string;
    statusHistory: { status: string; message: string; date: string }[];
    currentStatus: { status: string; message: string; date: string };
  } {
    const statusHistory = [];

    if (order.createdAt) {
      statusHistory.push({
        status: OrderStatus.Pending,
        message: translateStatus(OrderStatus.Pending),
        date: DateUtils.formatToBrazilianDateTime(order.createdAt),
      });
    }

    if (order.awaitingPickupAt) {
      statusHistory.push({
        status: OrderStatus.AwaitingPickup,
        message: translateStatus(OrderStatus.AwaitingPickup),
        date: DateUtils.formatToBrazilianDateTime(order.awaitingPickupAt),
      });
    }

    if (order.pickedUpAt) {
      statusHistory.push({
        status: OrderStatus.PickedUp,
        message: translateStatus(OrderStatus.PickedUp),
        date: DateUtils.formatToBrazilianDateTime(order.pickedUpAt),
      });
    }

    if (order.deliveredAt) {
      statusHistory.push({
        status: OrderStatus.Delivered,
        message: translateStatus(OrderStatus.Delivered),
        date: DateUtils.formatToBrazilianDateTime(order.deliveredAt),
      });
    }

    if (order.returnedAt) {
      statusHistory.push({
        status: OrderStatus.Returned,
        message: translateStatus(OrderStatus.Returned),
        date: DateUtils.formatToBrazilianDateTime(order.returnedAt),
      });
    }

    statusHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const currentStatus = statusHistory[statusHistory.length - 1];

    const filteredStatusHistory = statusHistory.filter(
      (status) => status !== currentStatus,
    );

    return {
      trackingCode: order.trackingCode,
      statusHistory: filteredStatusHistory,
      currentStatus,
    };
  }
}
