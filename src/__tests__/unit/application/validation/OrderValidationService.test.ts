import 'reflect-metadata';
import { Repository } from 'typeorm';
import { OrderValidationService } from '../../../../application/validation/OrderValidationService';
import { Recipient } from '../../../../domain/entities/Recipient';
import { Order } from '../../../../domain/entities/Order';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { UpdateRecipientDto } from '../../../../application/dtos/recipient/UpdateRecipientDto';
import { UserRole } from '../../../../domain/enums/UserRole';
import { IOrderRepository } from '../../../../domain/repositories/IOrderRepository';
import { User } from '../../../../domain/entities/User';
import OrderValidator from '../../../../domain/validators/OrderValidator';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { getDistance } from 'geolib';
import { ExternalServices } from '../../../../infrastructure/externalService/ExternalService';

jest.mock('geolib', () => ({
  getDistance: jest.fn(),
}));

jest.mock('../../../../infrastructure/externalService/ExternalService', () => ({
  ExternalServices: {
    getAddressByZipCode: jest.fn(),
  },
}));

jest.mock('../../../../domain/validators/OrderValidator');

describe('OrderValidationService', () => {
  let mockDataSource: { getRepository: jest.Mock };
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let service: OrderValidationService;

  beforeEach(() => {
    mockDataSource = { getRepository: jest.fn() } as any;
    mockOrderRepository = {
      findById: jest.fn(),
      findByFilter: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<IOrderRepository>;

    service = new OrderValidationService(
      mockDataSource as any,
      mockOrderRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateRecipient', () => {
    it('should throw an error if the recipient is not found', async () => {
      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(null),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      mockDataSource.getRepository.mockReturnValue(mockRecipientRepo);

      await expect(service.validateRecipient('invalid-id')).rejects.toThrow(
        new ApplicationError('Recipient not found', 404),
      );
    });

    it('should throw an error if the recipient email does not match', async () => {
      const recipient = {
        id: 'valid-id',
        email: 'recipient@example.com',
      } as Recipient;

      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(recipient),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      mockDataSource.getRepository.mockReturnValue(mockRecipientRepo);

      const recipientDto: UpdateRecipientDto = {
        email: 'different@example.com',
      };

      await expect(
        service.validateRecipient('valid-id', recipientDto),
      ).rejects.toThrow(new ApplicationError('Email mismatch', 400));
    });

    it('should return the recipient if found and email matches', async () => {
      const recipient = {
        id: 'valid-id',
        email: 'recipient@example.com',
      } as Recipient;

      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(recipient),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      mockDataSource.getRepository.mockReturnValue(mockRecipientRepo);

      const recipientDto: UpdateRecipientDto = {
        email: 'recipient@example.com',
      };

      const result = await service.validateRecipient('valid-id', recipientDto);
      expect(result).toEqual(recipient);
    });

    it('should return the recipient if found and no email provided in dto', async () => {
      const recipient = {
        id: 'valid-id',
        email: 'recipient@example.com',
      } as Recipient;

      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(recipient),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      mockDataSource.getRepository.mockReturnValue(mockRecipientRepo);

      const result = await service.validateRecipient('valid-id');
      expect(result).toEqual(recipient);
    });
  });

  describe('validateDeliveryman', () => {
    it('should throw an error if the deliveryman is not found', async () => {
      const mockUserRepo = {
        findOneBy: jest.fn().mockResolvedValue(null),
      } as unknown as jest.Mocked<Repository<any>>;

      mockDataSource.getRepository.mockReturnValue(mockUserRepo);

      await expect(service.validateDeliveryman('invalid-id')).rejects.toThrow(
        new ApplicationError('Deliveryman not found', 404),
      );
    });

    it('should throw an error if the user is not a deliveryman', async () => {
      const user = { id: 'valid-id', role: UserRole.Admin };
      const mockUserRepo = {
        findOneBy: jest.fn().mockResolvedValue(user),
      } as unknown as jest.Mocked<Repository<any>>;

      mockDataSource.getRepository.mockReturnValue(mockUserRepo);

      await expect(service.validateDeliveryman('valid-id')).rejects.toThrow(
        new ApplicationError('User is not a deliveryman', 403),
      );
    });

    it('should return the deliveryman if valid', async () => {
      const user = { id: 'valid-id', role: UserRole.Deliveryman };
      const mockUserRepo = {
        findOneBy: jest.fn().mockResolvedValue(user),
      } as unknown as jest.Mocked<Repository<any>>;

      mockDataSource.getRepository.mockReturnValue(mockUserRepo);

      const result = await service.validateDeliveryman('valid-id');
      expect(result).toEqual(user);
    });
  });

  describe('validateOrderExistence', () => {
    it('should throw an error if the order is not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.validateOrderExistence('invalid-id'),
      ).rejects.toThrow(new ApplicationError('Order not found', 404));
    });

    it('should return the order if found', async () => {
      const order = { id: 'valid-id' } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderExistence('valid-id');
      expect(result).toEqual(order);
    });
  });
  describe('validateAndUpdateOrderDetails', () => {
    it('should validate and update recipient and deliveryman if both are provided', async () => {
      const order = { id: 'order-id' } as Order;
      const recipient = { id: 'recipient-id' } as Recipient;
      const deliveryman = {
        id: 'deliveryman-id',
        role: UserRole.Deliveryman,
      } as User;

      (OrderValidator.updateOrderSchema.safeParse as jest.Mock).mockReturnValue(
        {
          success: true,
          data: {
            recipientId: 'recipient-id',
            deliverymanId: 'deliveryman-id',
          },
        },
      );

      mockOrderRepository.findById.mockResolvedValue(order);

      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(recipient),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      const mockUserRepo = {
        findOneBy: jest.fn().mockResolvedValue(deliveryman),
      } as unknown as jest.Mocked<Repository<User>>;

      mockDataSource.getRepository
        .mockReturnValueOnce(mockRecipientRepo)
        .mockReturnValueOnce(mockUserRepo);

      const result = await service.validateAndUpdateOrderDetails('order-id', {
        recipientId: 'recipient-id',
        deliverymanId: 'deliveryman-id',
      });
      expect(result).toEqual(order);
      expect(order.recipient).toEqual(recipient);
      expect(order.deliveryman).toEqual(deliveryman);
    });

    it('should throw an error if validation fails', async () => {
      (OrderValidator.updateOrderSchema.safeParse as jest.Mock).mockReturnValue(
        {
          success: false,
          error: {
            format: () => 'Validation error',
          },
        },
      );

      await expect(
        service.validateAndUpdateOrderDetails('order-id', {} as any),
      ).rejects.toThrow(
        new ApplicationError('Validation failed: Validation error', 400),
      );
    });

    it('should throw an error if order is not found', async () => {
      (OrderValidator.updateOrderSchema.safeParse as jest.Mock).mockReturnValue(
        {
          success: true,
          data: {},
        },
      );

      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.validateAndUpdateOrderDetails('order-id', {} as any),
      ).rejects.toThrow(new ApplicationError('Order not found', 404));
    });

    it('should validate and update recipient if recipientId is provided', async () => {
      const order = { id: 'order-id' } as Order;
      const recipient = { id: 'recipient-id' } as Recipient;

      (OrderValidator.updateOrderSchema.safeParse as jest.Mock).mockReturnValue(
        {
          success: true,
          data: { recipientId: 'recipient-id' },
        },
      );

      mockOrderRepository.findById.mockResolvedValue(order);

      const mockRecipientRepo = {
        findOneBy: jest.fn().mockResolvedValue(recipient),
      } as unknown as jest.Mocked<Repository<Recipient>>;

      mockDataSource.getRepository.mockReturnValue(mockRecipientRepo);

      const result = await service.validateAndUpdateOrderDetails('order-id', {
        recipientId: 'recipient-id',
      });
      expect(result).toEqual(order);
      expect(order.recipient).toEqual(recipient);
    });

    it('should validate and update deliveryman if deliverymanId is provided', async () => {
      const order = { id: 'order-id' } as Order;
      const deliveryman = {
        id: 'deliveryman-id',
        role: UserRole.Deliveryman,
      } as User;

      (OrderValidator.updateOrderSchema.safeParse as jest.Mock).mockReturnValue(
        {
          success: true,
          data: { deliverymanId: 'deliveryman-id' },
        },
      );

      mockOrderRepository.findById.mockResolvedValue(order);

      const mockUserRepo = {
        findOneBy: jest.fn().mockResolvedValue(deliveryman),
      } as unknown as jest.Mocked<Repository<User>>;

      mockDataSource.getRepository.mockReturnValue(mockUserRepo);

      const result = await service.validateAndUpdateOrderDetails('order-id', {
        deliverymanId: 'deliveryman-id',
      });
      expect(result).toEqual(order);
      expect(order.deliveryman).toEqual(deliveryman);
    });
  });
  describe('validateOrderTransition', () => {
    it('should throw an error for invalid status transitions', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
        status: OrderStatus.Pending,
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.validateOrderTransition(
          'order-id',
          OrderStatus.Delivered,
          'deliveryman-id',
          UserRole.Deliveryman,
        ),
      ).rejects.toThrow(
        new ApplicationError(
          `Invalid status transition from ${OrderStatus.Pending} to ${OrderStatus.Delivered}`,
          400,
        ),
      );
    });

    it('should allow valid status transitions for admins', async () => {
      const order = {
        id: 'order-id',
        status: OrderStatus.AwaitingPickup,
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderTransition(
        'order-id',
        OrderStatus.PickedUp,
        'admin-id',
        UserRole.Admin,
      );
      expect(result).toEqual(order);
    });

    it('should throw an error if the order is not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.validateOrderTransition(
          'order-id',
          OrderStatus.PickedUp,
          'deliveryman-id',
          UserRole.Deliveryman,
        ),
      ).rejects.toThrow(new ApplicationError('Order not found', 404));
    });

    it('should throw an error if the user is neither the deliveryman nor an admin', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'other-deliveryman-id' },
        status: OrderStatus.Pending,
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.validateOrderTransition(
          'order-id',
          OrderStatus.PickedUp,
          'deliveryman-id',
          UserRole.Deliveryman,
        ),
      ).rejects.toThrow(
        new ApplicationError(
          'You do not have permission to update this order',
          403,
        ),
      );
    });

    it('should throw an error if the status transition is invalid', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
        status: OrderStatus.Pending,
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.validateOrderTransition(
          'order-id',
          OrderStatus.Delivered,
          'deliveryman-id',
          UserRole.Deliveryman,
        ),
      ).rejects.toThrow(
        new ApplicationError(
          `Invalid status transition from ${OrderStatus.Pending} to ${OrderStatus.Delivered}`,
          400,
        ),
      );
    });

    it('should return the order if the status transition is valid and the user is authorized', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
        status: OrderStatus.Pending,
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderTransition(
        'order-id',
        OrderStatus.AwaitingPickup,
        'deliveryman-id',
        UserRole.Deliveryman,
      );
      expect(result).toEqual(order);
    });

    it('should return the order if the status transition is valid and the user is an admin', async () => {
      const order = { id: 'order-id', status: OrderStatus.Pending } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderTransition(
        'order-id',
        OrderStatus.AwaitingPickup,
        'admin-id',
        UserRole.Admin,
      );
      expect(result).toEqual(order);
    });
  });
  describe('validateOrderForDelivery', () => {
    it('should validate the delivery if all conditions are met', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
      } as Order;
      const mockImageFile = {
        originalname: 'photo.jpg',
      } as Express.Multer.File;

      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderForDelivery(
        'order-id',
        'deliveryman-id',
        mockImageFile,
      );
      expect(result).toEqual(order);
    });

    it('should throw an error if the order is not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.validateOrderForDelivery('invalid-order-id', 'deliveryman-id', {
          originalname: 'photo.jpg',
        } as Express.Multer.File),
      ).rejects.toThrow(new ApplicationError('Order not found', 404));
    });

    it('should throw an error if the user is not the assigned deliveryman', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'other-deliveryman-id' },
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.validateOrderForDelivery('order-id', 'deliveryman-id', {
          originalname: 'photo.jpg',
        } as Express.Multer.File),
      ).rejects.toThrow(
        new ApplicationError(
          'Only the assigned delivery person can mark the order as delivered',
          403,
        ),
      );
    });

    it('should throw an error if no image file is provided', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        service.validateOrderForDelivery(
          'order-id',
          'deliveryman-id',
          null as any,
        ),
      ).rejects.toThrow(
        new ApplicationError(
          'A delivery photo is required to mark as delivered',
          400,
        ),
      );
    });

    it('should return the order if all validations pass', async () => {
      const order = {
        id: 'order-id',
        deliveryman: { id: 'deliveryman-id' },
      } as Order;
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await service.validateOrderForDelivery(
        'order-id',
        'deliveryman-id',
        { originalname: 'photo.jpg' } as Express.Multer.File,
      );
      expect(result).toEqual(order);
    });
  });
  describe('findNearbyDeliveries', () => {
    it('should throw an error if zip code is not provided', async () => {
      await expect(
        service.findNearbyDeliveries('deliveryman-id', '', mockOrderRepository),
      ).rejects.toThrow(new ApplicationError('Zip code not provided', 400));
    });

    it('should throw an error if no deliveries are found', async () => {
      mockOrderRepository.findByFilter.mockResolvedValue([]);

      await expect(
        service.findNearbyDeliveries(
          'deliveryman-id',
          '12345',
          mockOrderRepository,
        ),
      ).rejects.toThrow(new ApplicationError('No deliveries found', 404));
    });

    it('should throw an error if no nearby deliveries are found', async () => {
      const orders = [
        {
          id: 'order-1',
          recipient: { latitude: null, longitude: null },
          status: OrderStatus.Pending,
        },
        {
          id: 'order-2',
          recipient: { latitude: null, longitude: null },
          status: OrderStatus.Pending,
        },
      ] as unknown as Order[];

      mockOrderRepository.findByFilter.mockResolvedValue(orders);

      (ExternalServices.getAddressByZipCode as jest.Mock).mockResolvedValue({
        latitude: 0,
        longitude: 0,
      });

      await expect(
        service.findNearbyDeliveries(
          'deliveryman-id',
          '12345',
          mockOrderRepository,
        ),
      ).rejects.toThrow(
        new ApplicationError('No nearby deliveries found', 404),
      );
    });

    it('should return nearby deliveries with distances', async () => {
      const orders = [
        {
          id: 'order-1',
          recipient: { latitude: 1, longitude: 1 },
          status: OrderStatus.Pending,
        },
        {
          id: 'order-2',
          recipient: { latitude: 2, longitude: 2 },
          status: OrderStatus.Pending,
        },
      ] as Order[];

      mockOrderRepository.findByFilter.mockResolvedValue(orders);

      (ExternalServices.getAddressByZipCode as jest.Mock).mockResolvedValue({
        latitude: 0,
        longitude: 0,
      });

      (getDistance as jest.Mock).mockImplementation(
        (
          { latitude: lat1, longitude: lng1 },
          { latitude: lat2, longitude: lng2 },
        ) => {
          return (
            Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) *
            1000
          );
        },
      );

      const result = await service.findNearbyDeliveries(
        'deliveryman-id',
        '12345',
        mockOrderRepository,
      );

      expect(result).toHaveLength(2);
      expect(result[0].order.id).toBe('order-1');
      expect(result[1].order.id).toBe('order-2');
      expect(result[0].distance).toBe('1.41 km');
      expect(result[1].distance).toBe('2.83 km');
    });
    it('should return no nearby deliveries if all orders have missing coordinates', async () => {
      const orders = [
        {
          id: 'order-1',
          recipient: { latitude: null, longitude: null },
          status: OrderStatus.Pending,
        },
        {
          id: 'order-2',
          recipient: { latitude: null, longitude: null },
          status: OrderStatus.Pending,
        },
      ] as unknown as Order[];

      mockOrderRepository.findByFilter.mockResolvedValue(orders);

      (ExternalServices.getAddressByZipCode as jest.Mock).mockResolvedValue({
        latitude: 0,
        longitude: 0,
      });

      await expect(
        service.findNearbyDeliveries(
          'deliveryman-id',
          '12345',
          mockOrderRepository,
        ),
      ).rejects.toThrow(
        new ApplicationError('No nearby deliveries found', 404),
      );
    });
    it('should sort nearby deliveries by distance correctly', async () => {
      const orders = [
        {
          id: 'order-1',
          recipient: { latitude: 1, longitude: 1 },
          status: OrderStatus.Pending,
        },
        {
          id: 'order-2',
          recipient: { latitude: 3, longitude: 3 },
          status: OrderStatus.Pending,
        },
      ] as Order[];

      mockOrderRepository.findByFilter.mockResolvedValue(orders);
      (ExternalServices.getAddressByZipCode as jest.Mock).mockResolvedValue({
        latitude: 0,
        longitude: 0,
      });

      (getDistance as jest.Mock).mockImplementation((origin, dest) => {
        const latDiff = dest.latitude - origin.latitude;
        const lngDiff = dest.longitude - origin.longitude;
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 1000;
      });

      const result = await service.findNearbyDeliveries(
        'deliveryman-id',
        '12345',
        mockOrderRepository,
      );

      expect(result[0].order.id).toBe('order-1');
      expect(result[1].order.id).toBe('order-2');
    });
  });
});
