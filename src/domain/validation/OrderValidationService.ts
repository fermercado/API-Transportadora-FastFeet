import { inject, injectable } from 'tsyringe';
import { DataSource } from 'typeorm';
import { Recipient } from '../../domain/entities/Recipient';
import { User } from '../../domain/entities/User';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { CreateRecipientDto } from '../../application/dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../../application/dtos/recipient/UpdateRecipientDto';
import { OrderStatus } from '../../domain/enums/OrderStatus';
import { getDistance } from 'geolib';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { UpdateOrderDto } from '../../application/dtos/order/UpdateOrderDto';
import OrderValidator from '../../domain/validators/OrderValidator';
import { UserRole } from '../../domain/enums/UserRole';

@injectable()
export class OrderValidationService {
  constructor(
    @inject('DataSource') private dataSource: DataSource,
    @inject('IOrderRepository') private orderRepository: IOrderRepository,
  ) {}

  async validateRecipient(
    recipientId: string,
    recipientDto?: CreateRecipientDto | UpdateRecipientDto,
  ): Promise<Recipient> {
    const recipientRepository = this.dataSource.getRepository(Recipient);
    const recipient = await recipientRepository.findOneBy({ id: recipientId });

    if (!recipient) {
      throw new ApplicationError('Recipient not found', 404);
    }

    if (
      recipientDto &&
      recipientDto.email &&
      recipient.email !== recipientDto.email
    ) {
      throw new ApplicationError('Email mismatch', 400);
    }

    return recipient;
  }

  async validateDeliveryman(deliverymanId: string): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    const deliveryman = await userRepository.findOneBy({ id: deliverymanId });

    if (!deliveryman) {
      throw new ApplicationError('Deliveryman not found', 404);
    }

    if (deliveryman.role !== UserRole.Deliveryman) {
      throw new ApplicationError('User is not a deliveryman', 403);
    }

    return deliveryman;
  }

  async validateOrderExistence(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new ApplicationError('Order not found', 404);
    }
    return order;
  }

  async validateAndUpdateOrderDetails(
    id: string,
    updateDto: UpdateOrderDto,
  ): Promise<Order> {
    const result = OrderValidator.updateOrderSchema.safeParse(updateDto);
    if (!result.success) {
      throw new ApplicationError(
        `Validation failed: ${result.error.format()}`,
        400,
      );
    }

    const order = await this.validateOrderExistence(id);

    if (result.data.recipientId) {
      order.recipient = await this.validateRecipient(result.data.recipientId);
    }
    if (result.data.deliverymanId) {
      order.deliveryman = await this.validateDeliveryman(
        result.data.deliverymanId,
      );
    }

    return order;
  }

  async validateOrderTransition(
    orderId: string,
    nextStatus: OrderStatus,
    deliverymanId: string,
    userRole: UserRole,
  ): Promise<Order> {
    const order = await this.validateOrderExistence(orderId);

    const isDeliveryman = order.deliveryman?.id === deliverymanId;

    const isAdminAllowed =
      userRole === UserRole.Admin &&
      (nextStatus === OrderStatus.AwaitingPickup ||
        nextStatus === OrderStatus.PickedUp);

    if (!isDeliveryman && !isAdminAllowed) {
      throw new ApplicationError(
        'You do not have permission to update this order',
        403,
      );
    }

    if (!this.isStatusTransitionValid(order.status, nextStatus)) {
      throw new ApplicationError(
        `Invalid status transition from ${order.status} to ${nextStatus}`,
        400,
      );
    }

    return order;
  }

  private isStatusTransitionValid(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ): boolean {
    const transitions: { [key in OrderStatus]?: OrderStatus[] } = {
      [OrderStatus.Pending]: [OrderStatus.AwaitingPickup],
      [OrderStatus.AwaitingPickup]: [OrderStatus.PickedUp],
      [OrderStatus.PickedUp]: [OrderStatus.Delivered, OrderStatus.Returned],
      [OrderStatus.Delivered]: [],
      [OrderStatus.Returned]: [
        OrderStatus.AwaitingPickup,
        OrderStatus.PickedUp,
      ],
    };

    return transitions[currentStatus]?.includes(nextStatus) ?? false;
  }

  async validateOrderForDelivery(
    orderId: string,
    deliverymanId: string,
    imageFile: Express.Multer.File,
  ): Promise<Order> {
    const order = await this.validateOrderExistence(orderId);
    if (order.deliveryman?.id !== deliverymanId) {
      throw new ApplicationError(
        'Only the assigned delivery person can mark the order as delivered',
        403,
      );
    }
    if (!imageFile) {
      throw new ApplicationError(
        'A delivery photo is required to mark as delivered',
        400,
      );
    }
    return order;
  }

  async findNearbyDeliveries(
    deliverymanId: string,
    zipCode: string,
    orderRepository: IOrderRepository,
  ): Promise<{ order: Order; distance: string }[]> {
    if (!zipCode) {
      throw new ApplicationError('Zip code not provided', 400);
    }

    const deliveries = await orderRepository.findByFilter({
      deliverymanId: deliverymanId,
    });

    if (deliveries.length === 0) {
      throw new ApplicationError('No deliveries found', 404);
    }

    const { latitude: originLat, longitude: originLng } =
      await ExternalServices.getAddressByZipCode(zipCode);

    const deliveriesWithDistance = deliveries
      .filter((order) => order.status !== OrderStatus.Delivered)
      .map((order) => {
        const { latitude: destLat, longitude: destLng } = order.recipient;

        if (!destLat || !destLng) {
          console.log(
            `Latitude and longitude information missing for the order with ID ${order.id}`,
          );
          return null;
        }

        const distance = getDistance(
          { latitude: originLat, longitude: originLng },
          { latitude: destLat, longitude: destLng },
        );

        const distanceInKm = (distance / 1000).toFixed(2);

        return {
          distance: `${distanceInKm} km`,
          order,
        };
      })
      .filter(Boolean) as { order: Order; distance: string }[];

    if (deliveriesWithDistance.length === 0) {
      throw new ApplicationError('No nearby deliveries found', 404);
    }

    return deliveriesWithDistance.sort((a, b) => {
      if (!a || !b) return 0;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });
  }
}
