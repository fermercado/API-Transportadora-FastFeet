import { inject, injectable } from 'tsyringe';
import { DataSource } from 'typeorm';
import { Recipient } from '../../domain/entities/Recipient';
import { User } from '../../domain/entities/User';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ApplicationError } from '../../infrastructure/shared/errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';
import { CreateRecipientDto } from '../dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../dtos/recipient/UpdateRecipientDto';
import { OrderStatus } from '../../domain/enums/OrderStatus';
import { getDistance } from 'geolib';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { UpdateOrderDto } from '../dtos/order/UpdateOrderDto';

@injectable()
export class OrderValidationService {
  constructor(
    @inject('DataSource')
    private dataSource: DataSource,
    @inject('IOrderRepository')
    private orderRepository: IOrderRepository,
  ) {}

  async validateRecipient(
    recipientId: string,
    recipientDto?: CreateRecipientDto | UpdateRecipientDto,
  ): Promise<Recipient> {
    const recipientRepository = this.dataSource.getRepository(Recipient);
    const recipient = await recipientRepository.findOneBy({ id: recipientId });

    if (!recipient) {
      const errorDetails: ErrorDetail[] = [
        {
          key: 'recipientId',
          value: recipientId,
        },
      ];
      throw new ApplicationError(
        'Recipient not found',
        404,
        true,
        errorDetails,
      );
    }

    if (
      recipientDto &&
      recipientDto.email &&
      recipient.email !== recipientDto.email
    ) {
      const errorDetails: ErrorDetail[] = [
        {
          key: 'email',
          value: recipientDto.email,
        },
      ];
      throw new ApplicationError('Email mismatch', 400, true, errorDetails);
    }

    return recipient;
  }

  async validateDeliveryman(deliverymanId: string): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    const deliveryman = await userRepository.findOneBy({ id: deliverymanId });
    if (!deliveryman) {
      const errorDetails: ErrorDetail[] = [
        {
          key: 'deliverymanId',
          value: deliverymanId,
        },
      ];
      throw new ApplicationError(
        'Deliveryman not found',
        404,
        true,
        errorDetails,
      );
    }
    return deliveryman;
  }

  async validateOrderExistence(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      const errorDetails: ErrorDetail[] = [
        {
          key: 'orderId',
          value: id,
        },
      ];
      throw new ApplicationError('Order not found', 404, true, errorDetails);
    }
    return order;
  }

  async validateOrderUpdate(
    id: string,
    updateDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.validateOrderExistence(id);

    if (updateDto.recipientId) {
      order.recipient = await this.validateRecipient(updateDto.recipientId);
    }

    if (updateDto.deliverymanId) {
      order.deliveryman = await this.validateDeliveryman(
        updateDto.deliverymanId,
      );
    }

    return order;
  }

  async validateOrderTransition(
    orderId: string,
    nextStatus: OrderStatus,
  ): Promise<Order> {
    const order = await this.validateOrderExistence(orderId);
    if (!this.isStatusTransitionValid(order.status, nextStatus)) {
      throw new ApplicationError(
        `Invalid status transition from ${order.status} to ${nextStatus}`,
        400,
        true,
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
      [OrderStatus.PickedUp]: [OrderStatus.Delivered],
      [OrderStatus.Delivered]: [],
      [OrderStatus.Returned]: [OrderStatus.AwaitingPickup],
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
        true,
      );
    }
    if (!imageFile) {
      throw new ApplicationError(
        'A delivery photo is required to mark as delivered',
        400,
        true,
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
      throw new Error('zipCode not provided');
    }

    const { latitude: originLat, longitude: originLng } =
      await ExternalServices.getAddressByZipCode(zipCode);
    const deliveries = await orderRepository.findByDeliveryman(deliverymanId);

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

    return deliveriesWithDistance.sort((a, b) => {
      if (!a || !b) return 0;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });
  }
}
