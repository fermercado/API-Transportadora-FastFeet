import 'reflect-metadata';
import { container } from 'tsyringe';
import { OrderService } from '../../../../application/services/OrderService';
import { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';
import { OrderValidationService } from '../../../../domain/validationServices/OrderValidationService';
import { TrackingCodeService } from '../../../../application/services/TrackingCodeService';
import { NotificationService } from '../../../../application/services/NotificationService';
import { OrderMapper } from '../../../../application/mappers/OrderMapper';
import { CreateOrderDto } from '../../../../application/dtos/order/CreateOrderDto';
import { UpdateOrderDto } from '../../../../application/dtos/order/UpdateOrderDto';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { UserRole } from '../../../../domain/enums/UserRole';
import { Order } from '../../../../domain/entities/Order';
import { DataSource } from 'typeorm';
import ImageUploadService from '../../../../infrastructure/service/ImageUploadService';
import { DeliveryNotificationService } from '../../../../application/services/DeliveryNotificationService';
import { OrderStatusMapper } from '../../../../application/mappers/OrderStatusMapper';
import { Recipient } from '../../../../domain/entities/Recipient';

const createMockOrder = (): Order => ({
  id: 'order-id',
  trackingCode: 'tracking-code',
  status: OrderStatus.Pending,
  createdAt: new Date(),
  updatedAt: new Date(),
  recipient: {
    id: 'recipient-id',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao.silva@example.com',
    cpf: '12345678900',
    zipCode: '12345',
    street: 'Street',
    number: 123,
    complement: '',
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'State',
    longitude: 0,
    latitude: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  deliveryman: {
    id: 'deliveryman-id',
    firstName: 'Maria',
    lastName: 'Silva',
    email: 'maria.silva@example.com',
    cpf: '98765432100',
    role: UserRole.Deliveryman,
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  awaitingPickupAt: undefined,
  pickedUpAt: undefined,
  deliveredAt: undefined,
  returnedAt: undefined,
  deliveryPhoto: undefined,
});

describe('OrderService', () => {
  let orderService: OrderService;
  let orderRepositoryMock: jest.Mocked<IOrderRepository>;
  let orderValidationServiceMock: jest.Mocked<OrderValidationService>;
  let trackingCodeServiceMock: jest.Mocked<TrackingCodeService>;
  let notificationServiceMock: jest.Mocked<NotificationService>;
  let orderMapperMock: jest.Mocked<OrderMapper>;
  let mockOrder: Order;

  beforeEach(() => {
    orderRepositoryMock = {
      create: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByFilter: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findByTrackingCode: jest.fn(),
    } as jest.Mocked<IOrderRepository>;

    orderValidationServiceMock = {
      validateRecipient: jest.fn(),
      validateDeliveryman: jest.fn(),
      validateOrderExistence: jest.fn(),
      validateAndUpdateOrderDetails: jest.fn(),
      validateOrderTransition: jest.fn(),
      validateOrderForDelivery: jest.fn(),
      findNearbyDeliveries: jest.fn(),
      dataSource: {} as DataSource,
      orderRepository: {} as IOrderRepository,
      isStatusTransitionValid: jest.fn(),
    } as unknown as jest.Mocked<OrderValidationService>;

    trackingCodeServiceMock = {
      generateTrackingCode: jest.fn(),
    } as jest.Mocked<TrackingCodeService>;

    notificationServiceMock = {
      notifyStatusChange: jest.fn(),
      deliveryNotificationService: {} as DeliveryNotificationService,
    } as unknown as jest.Mocked<NotificationService>;

    orderMapperMock = {
      toDto: jest.fn(),
    } as jest.Mocked<OrderMapper>;

    container.clearInstances();
    container.registerInstance<IOrderRepository>(
      'IOrderRepository',
      orderRepositoryMock,
    );
    container.registerInstance<OrderValidationService>(
      'OrderValidationService',
      orderValidationServiceMock,
    );
    container.registerInstance<TrackingCodeService>(
      'TrackingCodeService',
      trackingCodeServiceMock,
    );
    container.registerInstance<NotificationService>(
      'NotificationService',
      notificationServiceMock,
    );
    container.registerInstance<OrderMapper>('OrderMapper', orderMapperMock);

    orderService = container.resolve(OrderService);

    mockOrder = createMockOrder();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };

      orderValidationServiceMock.validateRecipient.mockResolvedValue(
        mockOrder.recipient,
      );
      orderValidationServiceMock.validateDeliveryman.mockResolvedValue(
        mockOrder.deliveryman!,
      );
      trackingCodeServiceMock.generateTrackingCode.mockReturnValue(
        'tracking-code',
      );
      orderRepositoryMock.create.mockResolvedValue(mockOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.createOrder(createOrderDto);

      expect(orderValidationServiceMock.validateRecipient).toHaveBeenCalledWith(
        'recipient-id',
      );
      expect(
        orderValidationServiceMock.validateDeliveryman,
      ).toHaveBeenCalledWith('deliveryman-id');
      expect(trackingCodeServiceMock.generateTrackingCode).toHaveBeenCalledWith(
        'Fast Feet',
        mockOrder.recipient.state,
      );
      expect(orderRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: mockOrder.recipient,
          deliveryman: mockOrder.deliveryman,
          trackingCode: 'tracking-code',
          status: OrderStatus.Pending,
        }),
      );
      expect(notificationServiceMock.notifyStatusChange).toHaveBeenCalledWith(
        mockOrder,
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });

    it('should throw an error if notifyStatusChange fails', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };

      orderValidationServiceMock.validateRecipient.mockResolvedValue(
        mockOrder.recipient,
      );
      orderValidationServiceMock.validateDeliveryman.mockResolvedValue(
        mockOrder.deliveryman!,
      );
      trackingCodeServiceMock.generateTrackingCode.mockReturnValue(
        'tracking-code',
      );
      orderRepositoryMock.create.mockResolvedValue(mockOrder);
      notificationServiceMock.notifyStatusChange.mockRejectedValue(
        new Error('Notification failed'),
      );

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Notification failed',
      );

      expect(notificationServiceMock.notifyStatusChange).toHaveBeenCalledWith(
        mockOrder,
      );
    });

    it('should throw an error if recipient validation fails', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };
      orderValidationServiceMock.validateRecipient.mockRejectedValue(
        new Error('Recipient validation failed'),
      );

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Recipient validation failed',
      );
      expect(orderValidationServiceMock.validateRecipient).toHaveBeenCalledWith(
        'recipient-id',
      );
    });

    it('should throw an error if deliveryman validation fails', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };
      orderValidationServiceMock.validateRecipient.mockResolvedValue(
        mockOrder.recipient,
      );
      orderValidationServiceMock.validateDeliveryman.mockRejectedValue(
        new Error('Deliveryman validation failed'),
      );

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Deliveryman validation failed',
      );
      expect(
        orderValidationServiceMock.validateDeliveryman,
      ).toHaveBeenCalledWith('deliveryman-id');
    });

    it('should throw an error if tracking code generation fails', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };
      orderValidationServiceMock.validateRecipient.mockResolvedValue(
        mockOrder.recipient,
      );
      orderValidationServiceMock.validateDeliveryman.mockResolvedValue(
        mockOrder.deliveryman!,
      );
      trackingCodeServiceMock.generateTrackingCode.mockImplementation(() => {
        throw new Error('Tracking code generation failed');
      });

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Tracking code generation failed',
      );
      expect(trackingCodeServiceMock.generateTrackingCode).toHaveBeenCalledWith(
        'Fast Feet',
        mockOrder.recipient.state,
      );
    });

    it('should throw an error if order creation in repository fails', async () => {
      const createOrderDto: CreateOrderDto = {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      };
      orderValidationServiceMock.validateRecipient.mockResolvedValue(
        mockOrder.recipient,
      );
      orderValidationServiceMock.validateDeliveryman.mockResolvedValue(
        mockOrder.deliveryman!,
      );
      trackingCodeServiceMock.generateTrackingCode.mockReturnValue(
        'tracking-code',
      );
      orderRepositoryMock.create.mockRejectedValue(
        new Error('Order creation failed'),
      );

      await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
        'Order creation failed',
      );

      expect(orderRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: mockOrder.recipient,
          deliveryman: mockOrder.deliveryman,
          trackingCode: 'tracking-code',
          status: OrderStatus.Pending,
        }),
      );
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order successfully', async () => {
      const updateOrderDto: UpdateOrderDto = {
        recipientId: 'new-recipient-id',
      };
      const mockUpdatedOrder: Order = {
        ...mockOrder,
        recipient: {
          id: 'new-recipient-id',
          firstName: 'Maria',
          lastName: 'Smith',
          email: 'maria.smith@example.com',
          cpf: '12345678901',
          zipCode: '54321',
          street: 'New Street',
          number: 456,
          complement: 'Apt 2',
          neighborhood: 'New Neighborhood',
          city: 'New City',
          state: 'New State',
          longitude: 1,
          latitude: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as Order;

      orderValidationServiceMock.validateAndUpdateOrderDetails.mockResolvedValue(
        mockUpdatedOrder,
      );
      orderRepositoryMock.save.mockResolvedValue(mockUpdatedOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockUpdatedOrder.createdAt.toISOString(),
        updatedAt: mockUpdatedOrder.updatedAt.toISOString(),
        recipient: mockUpdatedOrder.recipient,
        deliveryman: mockUpdatedOrder.deliveryman,
      });

      const result = await orderService.updateOrder('order-id', updateOrderDto);

      expect(
        orderValidationServiceMock.validateAndUpdateOrderDetails,
      ).toHaveBeenCalledWith('order-id', updateOrderDto);
      expect(orderRepositoryMock.save).toHaveBeenCalledWith(mockUpdatedOrder);
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(mockUpdatedOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        recipient: mockUpdatedOrder.recipient,
        deliveryman: mockUpdatedOrder.deliveryman,
      });
    });
  });

  describe('deleteOrder', () => {
    it('should delete an existing order successfully', async () => {
      orderValidationServiceMock.validateOrderExistence.mockResolvedValue(
        mockOrder,
      );

      await orderService.deleteOrder('order-id');

      expect(
        orderValidationServiceMock.validateOrderExistence,
      ).toHaveBeenCalledWith('order-id');
      expect(orderRepositoryMock.remove).toHaveBeenCalledWith('order-id');
    });
  });

  describe('getOrderById', () => {
    it('should return the order by ID', async () => {
      orderValidationServiceMock.validateOrderExistence.mockResolvedValue(
        mockOrder,
      );
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.getOrderById('order-id');

      expect(
        orderValidationServiceMock.validateOrderExistence,
      ).toHaveBeenCalledWith('order-id');
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });

    it('should return null if order does not exist', async () => {
      orderValidationServiceMock.validateOrderExistence.mockResolvedValue(
        null as any,
      );

      const result = await orderService.getOrderById('non-existing-order-id');

      expect(
        orderValidationServiceMock.validateOrderExistence,
      ).toHaveBeenCalledWith('non-existing-order-id');
      expect(result).toBeNull();
    });
  });

  describe('listOrders', () => {
    it('should list all orders when no status is provided', async () => {
      const mockOrders = [mockOrder];
      orderRepositoryMock.find.mockResolvedValue(mockOrders);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.listOrders();

      expect(orderRepositoryMock.find).toHaveBeenCalled();
      expect(orderMapperMock.toDto).toHaveBeenCalledTimes(mockOrders.length);
      expect(result).toEqual([
        {
          id: 'order-id',
          trackingCode: 'tracking-code',
          status: OrderStatus.Pending,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          recipient: mockOrder.recipient,
          deliveryman: mockOrder.deliveryman,
        },
      ]);
    });

    it('should list orders filtered by status', async () => {
      const mockOrders = [mockOrder];
      orderRepositoryMock.findByFilter.mockResolvedValue(mockOrders);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.listOrders(OrderStatus.Pending);

      expect(orderRepositoryMock.findByFilter).toHaveBeenCalledWith({
        status: OrderStatus.Pending,
      });
      expect(orderMapperMock.toDto).toHaveBeenCalledTimes(mockOrders.length);
      expect(result).toEqual([
        {
          id: 'order-id',
          trackingCode: 'tracking-code',
          status: OrderStatus.Pending,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          recipient: mockOrder.recipient,
          deliveryman: mockOrder.deliveryman,
        },
      ]);
    });
  });

  describe('markOrderAsWaiting', () => {
    it('should mark order as awaiting pickup', async () => {
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.AwaitingPickup,
        awaitingPickupAt: new Date(),
      };
      orderValidationServiceMock.validateOrderTransition.mockResolvedValue(
        mockOrder,
      );
      orderRepositoryMock.save.mockResolvedValue(updatedOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.AwaitingPickup,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        awaitingPickupAt: updatedOrder.awaitingPickupAt?.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.markOrderAsWaiting({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.AwaitingPickup,
      });

      expect(
        orderValidationServiceMock.validateOrderTransition,
      ).toHaveBeenCalledWith({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.AwaitingPickup,
      });
      expect(orderRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.AwaitingPickup }),
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(updatedOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.AwaitingPickup,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        awaitingPickupAt: expect.any(String),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });
  });

  describe('pickupOrder', () => {
    it('should mark order as picked up', async () => {
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.PickedUp,
        pickedUpAt: new Date(),
      };
      orderValidationServiceMock.validateOrderTransition.mockResolvedValue(
        mockOrder,
      );
      orderRepositoryMock.save.mockResolvedValue(updatedOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.PickedUp,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        pickedUpAt: updatedOrder.pickedUpAt?.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.pickupOrder({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.PickedUp,
      });

      expect(
        orderValidationServiceMock.validateOrderTransition,
      ).toHaveBeenCalledWith({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.PickedUp,
      });
      expect(orderRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.PickedUp }),
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(updatedOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.PickedUp,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        pickedUpAt: expect.any(String),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });
  });

  describe('markOrderAsDelivered', () => {
    it('should mark order as delivered', async () => {
      const imageFile = { path: 'path/to/image.jpg' } as Express.Multer.File;
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.Delivered,
        deliveredAt: new Date(),
        deliveryPhoto: 'url/to/image.jpg',
      };
      orderValidationServiceMock.validateOrderForDelivery.mockResolvedValue(
        mockOrder,
      );
      orderRepositoryMock.save.mockResolvedValue(updatedOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Delivered,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        deliveredAt: updatedOrder.deliveredAt?.toISOString(),
        deliveryPhoto: 'url/to/image.jpg',
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      jest
        .spyOn(ImageUploadService, 'uploadImage')
        .mockResolvedValue('url/to/image.jpg');

      const result = await orderService.markOrderAsDelivered({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        imageFile,
      });

      expect(
        orderValidationServiceMock.validateOrderForDelivery,
      ).toHaveBeenCalledWith({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        imageFile,
      });
      expect(orderRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OrderStatus.Delivered,
          deliveryPhoto: 'url/to/image.jpg',
        }),
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(updatedOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Delivered,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deliveredAt: expect.any(String),
        deliveryPhoto: 'url/to/image.jpg',
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });
  });

  describe('returnOrder', () => {
    it('should mark order as returned', async () => {
      const updatedOrder = {
        ...mockOrder,
        status: OrderStatus.Returned,
        returnedAt: new Date(),
      };
      orderValidationServiceMock.validateOrderTransition.mockResolvedValue(
        mockOrder,
      );
      orderRepositoryMock.save.mockResolvedValue(updatedOrder);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Returned,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        returnedAt: updatedOrder.returnedAt?.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.returnOrder({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.Returned,
      });

      expect(
        orderValidationServiceMock.validateOrderTransition,
      ).toHaveBeenCalledWith({
        orderId: 'order-id',
        deliverymanId: 'deliveryman-id',
        userRole: UserRole.Deliveryman,
        nextStatus: OrderStatus.Returned,
      });
      expect(orderRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.Returned }),
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(updatedOrder);
      expect(result).toEqual({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Returned,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        returnedAt: expect.any(String),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });
    });
  });

  describe('findDeliveriesForDeliverer', () => {
    it('should return deliveries for the given deliverer', async () => {
      const mockDeliveries = [mockOrder];
      orderRepositoryMock.findByFilter.mockResolvedValue(mockDeliveries);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.findDeliveriesForDeliverer({
        deliverymanId: 'deliveryman-id',
      });

      expect(orderRepositoryMock.findByFilter).toHaveBeenCalledWith({
        deliverymanId: 'deliveryman-id',
      });
      expect(result).toEqual([
        {
          id: 'order-id',
          trackingCode: 'tracking-code',
          status: OrderStatus.Pending,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          recipient: mockOrder.recipient,
          deliveryman: mockOrder.deliveryman,
        },
      ]);
    });
  });

  describe('findNearbyDeliveries', () => {
    it('should return nearby deliveries for the given deliverer and zip code', async () => {
      const mockDelivery = { order: mockOrder, distance: '10 km' };
      orderValidationServiceMock.findNearbyDeliveries.mockResolvedValue([
        mockDelivery,
      ]);
      orderMapperMock.toDto.mockReturnValue({
        id: 'order-id',
        trackingCode: 'tracking-code',
        status: OrderStatus.Pending,
        createdAt: mockOrder.createdAt.toISOString(),
        updatedAt: mockOrder.updatedAt.toISOString(),
        recipient: mockOrder.recipient,
        deliveryman: mockOrder.deliveryman,
      });

      const result = await orderService.findNearbyDeliveries({
        deliverymanId: 'deliveryman-id',
        zipCode: '12345',
      });

      expect(
        orderValidationServiceMock.findNearbyDeliveries,
      ).toHaveBeenCalledWith(
        {
          deliverymanId: 'deliveryman-id',
          zipCode: '12345',
        },
        orderRepositoryMock,
      );
      expect(orderMapperMock.toDto).toHaveBeenCalledWith(mockOrder);
      expect(result).toEqual([
        {
          order: {
            id: 'order-id',
            trackingCode: 'tracking-code',
            status: OrderStatus.Pending,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            recipient: mockOrder.recipient,
            deliveryman: mockOrder.deliveryman,
          },
          distance: '10 km',
        },
      ]);
    });
  });
  describe('getOrderStatusByTrackingCode', () => {
    it('should return order status DTO when a valid tracking code is provided', async () => {
      const mockOrder: Order = {
        id: '1',
        trackingCode: 'valid-tracking-code',
        status: OrderStatus.Delivered,
        createdAt: new Date(),
        awaitingPickupAt: new Date(),
        pickedUpAt: new Date(),
        deliveredAt: new Date(),
        returnedAt: undefined,
        updatedAt: new Date(),
        recipient: new Recipient(),
      };
      orderRepositoryMock.findByTrackingCode.mockResolvedValue(mockOrder);

      const expectedDto = OrderStatusMapper.toDto(mockOrder);
      const result = await orderService.getOrderStatusByTrackingCode(
        'valid-tracking-code',
      );

      expect(orderRepositoryMock.findByTrackingCode).toHaveBeenCalledWith(
        'valid-tracking-code',
      );
      expect(result).toEqual(expectedDto);
    });

    it('should throw an error if the tracking code does not match any order', async () => {
      orderRepositoryMock.findByTrackingCode.mockResolvedValue(null);

      await expect(
        orderService.getOrderStatusByTrackingCode('invalid-tracking-code'),
      ).rejects.toThrow('Order not found');

      expect(orderRepositoryMock.findByTrackingCode).toHaveBeenCalledWith(
        'invalid-tracking-code',
      );
    });
  });
});
