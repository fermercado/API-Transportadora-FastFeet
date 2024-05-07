import { Order } from '../../domain/entities/Order';
import { OrderResponseDto } from '../dtos/order/ResponseOrderDto';
import { injectable } from 'tsyringe';
import { DateUtils } from '../utils/dateUtils';

@injectable()
export class OrderMapper {
  public toDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      status: order.status,
      deliveryPhoto: order.deliveryPhoto,
      createdAt: DateUtils.formatToBrazilianDateTime(order.createdAt),
      updatedAt: DateUtils.formatToBrazilianDateTime(order.updatedAt),
      awaitingPickupAt: DateUtils.formatToBrazilianDateTime(
        order.awaitingPickupAt,
      ),
      pickedUpAt: DateUtils.formatToBrazilianDateTime(order.pickedUpAt),
      deliveredAt: DateUtils.formatToBrazilianDateTime(order.deliveredAt),
      returnedAt: DateUtils.formatToBrazilianDateTime(order.returnedAt),
      recipient: order.recipient
        ? {
            id: order.recipient.id,
            firstName: order.recipient.firstName,
            lastName: order.recipient.lastName,
            email: order.recipient.email,
            cpf: order.recipient.cpf,
            zipCode: order.recipient.zipCode,
            street: order.recipient.street,
            number: order.recipient.number,
            complement: order.recipient.complement || '',
            neighborhood: order.recipient.neighborhood,
            city: order.recipient.city,
            state: order.recipient.state,
            longitude: order.recipient.longitude,
            latitude: order.recipient.latitude,
          }
        : undefined,
      deliveryman: order.deliveryman
        ? {
            id: order.deliveryman.id,
            firstName: order.deliveryman.firstName,
            lastName: order.deliveryman.lastName,
            email: order.deliveryman.email,
            cpf: order.deliveryman.cpf,
            role: order.deliveryman.role,
          }
        : undefined,
    };
  }
}
