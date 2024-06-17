import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { OrderController } from '../../../../ui/controllers/OrderController';
import { OrderService } from '../../../../application/services/OrderService';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { OrderResponseDto } from '../../../../application/dtos/order/ResponseOrderDto';
import { Readable } from 'typeorm/platform/PlatformTools';

jest.mock('../../../../application/services/OrderService');

const mockOrderDto: OrderResponseDto = {
  id: '1',
  trackingCode: '123',
  status: OrderStatus.Pending,
  deliveryPhoto: undefined,
  recipient: {
    id: '1',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao.silva@example.com',
    cpf: '12345678900',
    zipCode: '12345-678',
    street: 'Street',
    number: 123,
    complement: '',
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'State',
    longitude: 0,
    latitude: 0,
  },
  deliveryman: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  awaitingPickupAt: undefined,
  pickedUpAt: undefined,
  deliveredAt: undefined,
  returnedAt: undefined,
};

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'photo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 12345,
  destination: 'uploads/',
  filename: 'photo.jpg',
  path: 'uploads/photo.jpg',
  buffer: Buffer.from(''),
  stream: new Readable(),
};

describe('OrderController', () => {
  let orderController: OrderController;
  let mockOrderService: jest.Mocked<OrderService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let next: NextFunction;

  beforeAll(() => {
    mockOrderService = new (OrderService as any)() as jest.Mocked<OrderService>;
    container.register('OrderService', { useValue: mockOrderService });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    orderController = container.resolve(OrderController);

    mockRequest = {
      params: {},
      body: {},
      query: {},
      headers: {},
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order and return status 201', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderDto);
      mockRequest.body = { description: 'Test Order' };

      await orderController.createOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        description: 'Test Order',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to create order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('updateOrder', () => {
    it('should update an order and return status 200', async () => {
      mockOrderService.updateOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.body = { description: 'Updated Order' };

      await orderController.updateOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.updateOrder).toHaveBeenCalledWith('1', {
        description: 'Updated Order',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.updateOrder.mockRejectedValue(error);

      await orderController.updateOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.updateOrder.mockRejectedValue(error);

      await orderController.updateOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to update order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order and return status 204', async () => {
      mockOrderService.deleteOrder.mockResolvedValue();
      mockRequest.params = { id: '1' };

      await orderController.deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.deleteOrder.mockRejectedValue(error);

      await orderController.deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.deleteOrder.mockRejectedValue(error);

      await orderController.deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to delete order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('getOrderById', () => {
    it('should return an order and status 200', async () => {
      mockOrderService.getOrderById.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should return 404 if the order is not found', async () => {
      mockOrderService.getOrderById.mockResolvedValue(null);
      mockRequest.params = { id: 'nonexistent' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Order not found', 404),
      );
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle error and throw ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.getOrderById.mockRejectedValue(error);
      mockRequest.params = { id: '1' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to retrieve order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('1');
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders and status 200', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.listOrders.mockResolvedValue(mockOrderList);
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOrders(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.listOrders).toHaveBeenCalledWith(
        OrderStatus.Pending,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.listOrders.mockRejectedValue(error);

      await orderController.listOrders(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.listOrders.mockRejectedValue(error);

      await orderController.listOrders(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to list orders', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('markOrderAsWaiting', () => {
    it('should mark an order as waiting and return status 200', async () => {
      mockOrderService.markOrderAsWaiting.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'admin' };

      await orderController.markOrderAsWaiting(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.markOrderAsWaiting).toHaveBeenCalledWith({
        orderId: '1',
        deliverymanId: 'user1',
        userRole: 'admin',
        nextStatus: OrderStatus.AwaitingPickup,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.markOrderAsWaiting.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'admin' };

      await orderController.markOrderAsWaiting(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.markOrderAsWaiting.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'admin' };

      await orderController.markOrderAsWaiting(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to mark order as waiting', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('pickupOrder', () => {
    it('should pickup an order and return status 200', async () => {
      mockOrderService.pickupOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.pickupOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.pickupOrder).toHaveBeenCalledWith({
        orderId: '1',
        deliverymanId: 'user1',
        userRole: 'deliveryman',
        nextStatus: OrderStatus.PickedUp,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.pickupOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.pickupOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.pickupOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.pickupOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to pickup order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('markOrderAsDelivered', () => {
    it('should mark an order as delivered and return status 200', async () => {
      mockOrderService.markOrderAsDelivered.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.markOrderAsDelivered).toHaveBeenCalledWith({
        orderId: '1',
        deliverymanId: 'user1',
        imageFile: mockFile,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should throw ApplicationError if no delivery photo is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = undefined;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Delivery photo file is required.', 400, true),
      );
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.markOrderAsDelivered.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.markOrderAsDelivered.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to mark order as delivered', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('returnOrder', () => {
    it('should return an order and return status 200', async () => {
      mockOrderService.returnOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.returnOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.returnOrder).toHaveBeenCalledWith({
        orderId: '1',
        deliverymanId: 'user1',
        userRole: 'deliveryman',
        nextStatus: OrderStatus.Returned,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.returnOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.returnOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.returnOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.returnOrder(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to return order', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('listDeliveriesForDeliveryman', () => {
    it('should return a list of deliveries for a deliveryman and status 200', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findDeliveriesForDeliverer.mockResolvedValue(
        mockOrderList,
      );
      mockRequest.params = { deliverymanId: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listDeliveriesForDeliveryman(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.findDeliveriesForDeliverer).toHaveBeenCalledWith({
        deliverymanId: 'deliveryman1',
        status: OrderStatus.Pending,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.params = { deliverymanId: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listDeliveriesForDeliveryman(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.params = { deliverymanId: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listDeliveriesForDeliveryman(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to list deliveries', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('listOwnDeliveries', () => {
    it('should return a list of own deliveries and status 200', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findDeliveriesForDeliverer.mockResolvedValue(
        mockOrderList,
      );
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOwnDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.findDeliveriesForDeliverer).toHaveBeenCalledWith({
        deliverymanId: 'deliveryman1',
        status: OrderStatus.Pending,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOwnDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOwnDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to list own deliveries', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });

  describe('findNearbyDeliveries', () => {
    it('should return a list of nearby deliveries and status 200', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findNearbyDeliveries.mockResolvedValue(
        mockOrderList as any,
      );
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.body = { zipCode: '12345-678' };

      await orderController.findNearbyDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(mockOrderService.findNearbyDeliveries).toHaveBeenCalledWith({
        deliverymanId: 'deliveryman1',
        zipCode: '12345-678',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle ApplicationError and call next with it', async () => {
      const error = new ApplicationError('Validation error', 400);
      mockOrderService.findNearbyDeliveries.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.body = { zipCode: '12345-678' };

      await orderController.findNearbyDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle generic error and throw ApplicationError', async () => {
      const error = new Error('Test error');
      mockOrderService.findNearbyDeliveries.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.body = { zipCode: '12345-678' };

      await orderController.findNearbyDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new ApplicationError('Failed to find nearby deliveries', 500, true, [
          { key: 'internal', value: error.message },
        ]),
      );
    });
  });
});
