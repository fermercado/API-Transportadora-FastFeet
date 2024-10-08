import { inject, injectable } from 'tsyringe';
import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { CreateOrderDto } from '../dtos/order/CreateOrderDto';
import { UpdateOrderDto } from '../dtos/order/UpdateOrderDto';
import { TransitionOrderDto } from '../dtos/order/TransitionOrderDto';
import { OrderValidationService } from '../../domain/validationServices/OrderValidationService';
import { OrderStatus } from '../../domain/enums/OrderStatus';
import { OperationOrderDto } from '../dtos/order/OperationOrderDto';
import { FindDeliveriesForDelivererDto } from '../dtos/order/FindDeliveriesForDelivererDto';
import { FindNearbyDeliveriesDto } from '../dtos/order/FindNearbyDeliveriesDto';
import ImageUploadService from '../../infrastructure/service/ImageUploadService';
import { OrderResponseDto } from '../dtos/order/ResponseOrderDto';
import { OrderMapper } from '../mappers/OrderMapper';
import { OrderFilter } from '../../domain/interface/OrderFilter';
import { TrackingCodeService } from '../services/TrackingCodeService';
import { NotificationService } from '../services/NotificationService';
import { OrderStatusMapper } from '../mappers/OrderStatusMapper';

@injectable()
export class OrderService {
  constructor(
    @inject('IOrderRepository') private orderRepository: IOrderRepository,
    @inject('OrderValidationService')
    private orderValidationService: OrderValidationService,
    @inject('OrderMapper') private orderMapper: OrderMapper,
    @inject('TrackingCodeService')
    private trackingCodeService: TrackingCodeService,
    @inject('NotificationService')
    private notificationService: NotificationService,
  ) {}

  public async createOrder(
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = new Order();
    order.recipient = await this.orderValidationService.validateRecipient(
      createOrderDto.recipientId,
    );
    order.deliveryman = await this.orderValidationService.validateDeliveryman(
      createOrderDto.deliverymanId,
    );
    order.trackingCode = this.trackingCodeService.generateTrackingCode(
      'Fast Feet',
      order.recipient.state,
    );
    order.status = OrderStatus.Pending;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    const savedOrder = await this.orderRepository.create(order);
    await this.notifyStatusChange(savedOrder);
    return this.orderMapper.toDto(savedOrder);
  }

  public async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order =
      await this.orderValidationService.validateAndUpdateOrderDetails(
        id,
        updateOrderDto,
      );
    order.updatedAt = new Date();
    const updatedOrder = await this.orderRepository.save(order);
    return this.orderMapper.toDto(updatedOrder);
  }

  public async deleteOrder(id: string): Promise<void> {
    await this.orderValidationService.validateOrderExistence(id);
    await this.orderRepository.remove(id);
  }

  public async getOrderById(id: string): Promise<OrderResponseDto | null> {
    const order = await this.orderValidationService.validateOrderExistence(id);
    if (!order) return null;
    return this.orderMapper.toDto(order);
  }

  public async listOrders(status?: OrderStatus): Promise<OrderResponseDto[]> {
    const orders = status
      ? await this.orderRepository.findByFilter({ status: status })
      : await this.orderRepository.find();
    return orders.map(this.orderMapper.toDto);
  }

  public async markOrderAsWaiting(
    dto: TransitionOrderDto,
  ): Promise<OrderResponseDto> {
    const order =
      await this.orderValidationService.validateOrderTransition(dto);
    order.status = OrderStatus.AwaitingPickup;
    order.awaitingPickupAt = new Date();
    order.updatedAt = new Date();
    const savedOrder = await this.orderRepository.save(order);
    await this.notifyStatusChange(savedOrder);
    return this.orderMapper.toDto(savedOrder);
  }

  public async pickupOrder(dto: TransitionOrderDto): Promise<OrderResponseDto> {
    const order =
      await this.orderValidationService.validateOrderTransition(dto);
    order.status = OrderStatus.PickedUp;
    order.pickedUpAt = new Date();
    order.updatedAt = new Date();
    const savedOrder = await this.orderRepository.save(order);
    await this.notifyStatusChange(savedOrder);
    return this.orderMapper.toDto(savedOrder);
  }

  public async markOrderAsDelivered(
    dto: OperationOrderDto,
  ): Promise<OrderResponseDto> {
    const order =
      await this.orderValidationService.validateOrderForDelivery(dto);
    const imageUrl = await ImageUploadService.uploadImage(dto.imageFile.path);
    order.deliveryPhoto = imageUrl;
    order.status = OrderStatus.Delivered;
    order.deliveredAt = new Date();
    order.updatedAt = new Date();
    const savedOrder = await this.orderRepository.save(order);
    await this.notifyStatusChange(savedOrder);
    return this.orderMapper.toDto(savedOrder);
  }

  public async returnOrder(dto: TransitionOrderDto): Promise<OrderResponseDto> {
    const order =
      await this.orderValidationService.validateOrderTransition(dto);
    order.status = OrderStatus.Returned;
    order.returnedAt = new Date();
    order.updatedAt = new Date();
    const savedOrder = await this.orderRepository.save(order);
    await this.notifyStatusChange(savedOrder);
    return this.orderMapper.toDto(savedOrder);
  }

  public async findDeliveriesForDeliverer(
    dto: FindDeliveriesForDelivererDto,
  ): Promise<OrderResponseDto[]> {
    const filter: OrderFilter = {
      deliverymanId: dto.deliverymanId,
      status: dto.status,
    };
    const orders = await this.orderRepository.findByFilter(filter);
    return orders.map(this.orderMapper.toDto);
  }

  public async findNearbyDeliveries(
    dto: FindNearbyDeliveriesDto,
  ): Promise<{ order: OrderResponseDto; distance: string }[]> {
    const deliveries = await this.orderValidationService.findNearbyDeliveries(
      dto,
      this.orderRepository,
    );
    return deliveries.map((delivery) => ({
      ...delivery,
      order: this.orderMapper.toDto(delivery.order),
    }));
  }

  private async notifyStatusChange(order: Order) {
    await this.notificationService.notifyStatusChange(order);
  }

  public async getOrderStatusByTrackingCode(
    trackingCode: string,
  ): Promise<any> {
    const order = await this.orderRepository.findByTrackingCode(trackingCode);
    if (!order) {
      throw new Error('Order not found');
    }
    return OrderStatusMapper.toDto(order);
  }
}
