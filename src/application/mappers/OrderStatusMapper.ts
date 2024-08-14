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
        date: order.createdAt.toISOString(),
      });
    }
    if (order.awaitingPickupAt) {
      statusHistory.push({
        status: OrderStatus.AwaitingPickup,
        message: translateStatus(OrderStatus.AwaitingPickup),
        date: order.awaitingPickupAt.toISOString(),
      });
    }
    if (order.pickedUpAt) {
      statusHistory.push({
        status: OrderStatus.PickedUp,
        message: translateStatus(OrderStatus.PickedUp),
        date: order.pickedUpAt.toISOString(),
      });
    }
    if (order.deliveredAt) {
      statusHistory.push({
        status: OrderStatus.Delivered,
        message: translateStatus(OrderStatus.Delivered),
        date: order.deliveredAt.toISOString(),
      });
    }
    if (order.returnedAt) {
      statusHistory.push({
        status: OrderStatus.Returned,
        message: translateStatus(OrderStatus.Returned),
        date: order.returnedAt.toISOString(),
      });
    }

    statusHistory.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const currentStatus = statusHistory[0];

    const filteredStatusHistory = statusHistory
      .slice(1)
      .reverse()
      .map((status) => ({
        ...status,
        date: DateUtils.formatToBrazilianDateTime(new Date(status.date)),
      }));

    return {
      trackingCode: order.trackingCode,
      statusHistory: filteredStatusHistory,
      currentStatus: {
        ...currentStatus,
        date: DateUtils.formatToBrazilianDateTime(new Date(currentStatus.date)),
      },
    };
  }
}
