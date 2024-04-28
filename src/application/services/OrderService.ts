import { inject, injectable } from 'tsyringe';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { CreateOrderDto } from '../dtos/order/CreateOrderDto';
import { UpdateOrderDto } from '../dtos/order/UpdateOrderDto';
import { OrderValidationService } from '../../application/validation/OrderValidationService';
import { OrderStatus } from '../../domain/enums/OrderStatus';
import { DeliveryNotificationService } from './DeliveryNotificationService';
import ImageUploadService from '../../infrastructure/service/ImageUploadService';

@injectable()
export class OrderService {
  constructor(
    @inject('IOrderRepository') private orderRepository: IOrderRepository,
    @inject('OrderValidationService')
    private orderValidationService: OrderValidationService,
    @inject('DeliveryNotificationService')
    private deliveryNotificationService: DeliveryNotificationService,
  ) {}

  private async notifyStatusChange(order: Order) {
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

  private generateTrackingCode(
    carrierName: string,
    recipientState: string,
  ): string {
    const carrierInitials = carrierName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    const uniqueNumber = Math.floor(Math.random() * 1e9)
      .toString()
      .padStart(9, '0');
    return `${carrierInitials}${uniqueNumber}${recipientState.toUpperCase()}`;
  }

  public async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new Order();
    order.recipient = await this.orderValidationService.validateRecipient(
      createOrderDto.recipientId,
    );
    order.deliveryman = await this.orderValidationService.validateDeliveryman(
      createOrderDto.deliverymanId,
    );
    order.trackingCode = this.generateTrackingCode(
      'Fast Feet',
      order.recipient.state,
    );
    order.status = OrderStatus.Pending;

    const savedOrder = await this.orderRepository.create(order);
    await this.notifyStatusChange(order);

    return savedOrder;
  }

  public async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.orderValidationService.validateOrderUpdate(
      id,
      updateOrderDto,
    );
    return await this.orderRepository.save(order);
  }

  public async deleteOrder(id: string): Promise<void> {
    await this.orderValidationService.validateOrderExistence(id);
    await this.orderRepository.remove(id);
  }

  public async getOrderById(id: string): Promise<Order | null> {
    return await this.orderValidationService.validateOrderExistence(id);
  }

  public async listOrders(): Promise<Order[]> {
    return await this.orderRepository.find();
  }

  async markOrderAsWaiting(orderId: string): Promise<Order> {
    const order = await this.orderValidationService.validateOrderTransition(
      orderId,
      OrderStatus.AwaitingPickup,
    );
    order.status = OrderStatus.AwaitingPickup;
    await this.orderRepository.save(order);
    await this.notifyStatusChange(order);
    return order;
  }

  async pickupOrder(orderId: string, _deliverymanId: string): Promise<Order> {
    const order = await this.orderValidationService.validateOrderTransition(
      orderId,
      OrderStatus.PickedUp,
    );
    order.status = OrderStatus.PickedUp;
    await this.orderRepository.save(order);
    await this.notifyStatusChange(order);
    return order;
  }

  async markOrderAsDelivered(
    orderId: string,
    deliverymanId: string,
    imageFile: Express.Multer.File,
  ): Promise<Order> {
    const order = await this.orderValidationService.validateOrderForDelivery(
      orderId,
      deliverymanId,
      imageFile,
    );

    const imageUrl = await ImageUploadService.uploadImage(imageFile.path);
    order.deliveryPhoto = imageUrl;
    order.status = OrderStatus.Delivered;
    await this.orderRepository.save(order);
    await this.notifyStatusChange(order);
    return order;
  }

  async returnOrder(orderId: string, _deliverymanId: string): Promise<Order> {
    const order = await this.orderValidationService.validateOrderTransition(
      orderId,
      OrderStatus.Returned,
    );
    order.status = OrderStatus.Returned;
    await this.orderRepository.save(order);
    await this.notifyStatusChange(order);
    return order;
  }

  public async findDeliveriesForDeliverer(
    deliverymanId: string,
  ): Promise<Order[]> {
    return this.orderRepository.findByDeliveryman(deliverymanId);
  }

  public async findNearbyDeliveries(
    deliverymanId: string,
    zipCode: string,
  ): Promise<{ order: Order; distance: string }[]> {
    return await this.orderValidationService.findNearbyDeliveries(
      deliverymanId,
      zipCode,
      this.orderRepository,
    );
  }
}
