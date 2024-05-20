import 'reflect-metadata';
import { Request, Response } from 'express';
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
  let mockNext: jest.Mock;

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

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order and return 201 status code', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrderDto);
      mockRequest.body = { description: 'Test Order' };

      await orderController.createOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.createOrder).toHaveBeenCalledWith({
        description: 'Test Order',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.createOrder.mockRejectedValue(error);
      mockRequest.body = { description: 'Test Order' };

      await orderController.createOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to create order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('updateOrder', () => {
    it('should update an order and return 200 status code', async () => {
      mockOrderService.updateOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.body = { description: 'Updated Order' };

      await orderController.updateOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.updateOrder).toHaveBeenCalledWith('1', {
        description: 'Updated Order',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.updateOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.body = { description: 'Updated Order' };

      await orderController.updateOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to update order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order and return 204 status code', async () => {
      mockOrderService.deleteOrder.mockResolvedValue();
      mockRequest.params = { id: '1' };

      await orderController.deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.deleteOrder).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.deleteOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };

      await orderController.deleteOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to delete order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('getOrderById', () => {
    it('should return an order and 200 status code', async () => {
      mockOrderService.getOrderById.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should return 404 if order not found', async () => {
      mockOrderService.getOrderById.mockResolvedValue(null);
      mockRequest.params = { id: 'nonexistent' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));

      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext).toBeInstanceOf(ApplicationError);
      expect(errorPassedToNext.statusCode).toBe(404);
      expect(errorPassedToNext.message).toBe('Order not found');
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.getOrderById.mockRejectedValue(error);
      mockRequest.params = { id: '1' };

      await orderController.getOrderById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to retrieve order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders and 200 status code', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.listOrders.mockResolvedValue(mockOrderList);
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOrders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.listOrders).toHaveBeenCalledWith(
        OrderStatus.Pending,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.listOrders.mockRejectedValue(error);
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOrders(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to list orders');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('markOrderAsWaiting', () => {
    it('should mark an order as waiting and return 200 status code', async () => {
      mockOrderService.markOrderAsWaiting.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'admin' };

      await orderController.markOrderAsWaiting(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.markOrderAsWaiting).toHaveBeenCalledWith(
        '1',
        'user1',
        'admin',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.markOrderAsWaiting.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'admin' };

      await orderController.markOrderAsWaiting(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to mark order as waiting');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('pickupOrder', () => {
    it('should pick up an order and return 200 status code', async () => {
      mockOrderService.pickupOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.pickupOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.pickupOrder).toHaveBeenCalledWith(
        '1',
        'user1',
        'deliveryman',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.pickupOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.pickupOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to pickup order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('markOrderAsDelivered', () => {
    it('should mark an order as delivered and return 200 status code', async () => {
      mockOrderService.markOrderAsDelivered.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.markOrderAsDelivered).toHaveBeenCalledWith(
        '1',
        'user1',
        mockFile,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle generic errors by using handleError', async () => {
      const genericError = new Error('Unexpected error');
      mockOrderService.markOrderAsDelivered.mockRejectedValue(genericError);

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe(
        'Failed to mark order as delivered',
      );
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Unexpected error' },
      ]);
    });

    it('should return 400 if no delivery photo is provided', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = undefined;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(400);
      expect(errorPassedToNext.message).toBe(
        'Delivery photo file is required.',
      );
      expect(errorPassedToNext.details).toBeUndefined();
    });

    it('should handle unknown errors correctly', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockOrderService.markOrderAsDelivered.mockRejectedValue(unexpectedError);

      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };
      mockRequest.file = mockFile;

      await orderController.markOrderAsDelivered(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe(
        'Failed to mark order as delivered',
      );
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Unexpected error' },
      ]);
    });
  });

  describe('returnOrder', () => {
    it('should return an order and return 200 status code', async () => {
      mockOrderService.returnOrder.mockResolvedValue(mockOrderDto);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.returnOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.returnOrder).toHaveBeenCalledWith(
        '1',
        'user1',
        'deliveryman',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderDto);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.returnOrder.mockRejectedValue(error);
      mockRequest.params = { id: '1' };
      mockRequest.user = { id: 'user1', role: 'deliveryman' };

      await orderController.returnOrder(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to return order');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('listDeliveriesForDeliveryman', () => {
    it('should return a list of deliveries for a deliveryman and 200 status code', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findDeliveriesForDeliverer.mockResolvedValue(
        mockOrderList,
      );
      mockRequest.params = { deliverymanId: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listDeliveriesForDeliveryman(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.findDeliveriesForDeliverer).toHaveBeenCalledWith(
        'deliveryman1',
        OrderStatus.Pending,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.params = { deliverymanId: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listDeliveriesForDeliveryman(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to list deliveries');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('listOwnDeliveries', () => {
    it('should return a list of own deliveries and 200 status code', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findDeliveriesForDeliverer.mockResolvedValue(
        mockOrderList,
      );
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOwnDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.findDeliveriesForDeliverer).toHaveBeenCalledWith(
        'deliveryman1',
        OrderStatus.Pending,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.findDeliveriesForDeliverer.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.query = { status: OrderStatus.Pending };

      await orderController.listOwnDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe('Failed to list own deliveries');
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });

  describe('findNearbyDeliveries', () => {
    it('should return a list of nearby deliveries and 200 status code', async () => {
      const mockOrderList = [mockOrderDto];
      mockOrderService.findNearbyDeliveries.mockResolvedValue(
        mockOrderList as any,
      );
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.body = { zipCode: '12345-678' };

      await orderController.findNearbyDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockOrderService.findNearbyDeliveries).toHaveBeenCalledWith(
        'deliveryman1',
        '12345-678',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrderList);
    });

    it('should handle error and call next with ApplicationError', async () => {
      const error = new Error('Test Error');
      mockOrderService.findNearbyDeliveries.mockRejectedValue(error);
      mockRequest.user = { id: 'deliveryman1' };
      mockRequest.body = { zipCode: '12345-678' };

      await orderController.findNearbyDeliveries(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));
      const errorPassedToNext = mockNext.mock.calls[0][0];
      expect(errorPassedToNext.statusCode).toBe(500);
      expect(errorPassedToNext.message).toBe(
        'Failed to find nearby deliveries',
      );
      expect(errorPassedToNext.details).toEqual([
        { key: 'internal', value: 'Test Error' },
      ]);
    });
  });
  describe('handleError', () => {
    it('should handle generic errors by wrapping them into an ApplicationError', () => {
      const genericError = new Error('Unexpected Error');

      orderController.handleError(genericError, 'Failed operation', mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));

      const calledWith = mockNext.mock.calls[0][0];
      expect(calledWith.message).toBe('Failed operation');
      expect(calledWith.statusCode).toBe(500);
      expect(calledWith.details).toEqual([
        { key: 'internal', value: 'Unexpected Error' },
      ]);
    });
    it('should handle errors without a message by using default error message', () => {
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';

      orderController.handleError(
        errorWithoutMessage,
        'Failed operation',
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));

      const calledWith = mockNext.mock.calls[0][0];
      expect(calledWith.message).toBe('Failed operation');
      expect(calledWith.statusCode).toBe(500);
      expect(calledWith.details).toEqual([
        { key: 'internal', value: 'Unknown error' },
      ]);
    });
    it('should handle non-Error objects gracefully', () => {
      const notAnError = {
        message: 'I am not an error object',
        statusCode: 404,
      };

      orderController.handleError(notAnError, 'Failed operation', mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApplicationError));

      const calledWith = mockNext.mock.calls[0][0];
      expect(calledWith.message).toBe('Failed operation');
      expect(calledWith.statusCode).toBe(500);
      expect(calledWith.details).toEqual([
        { key: 'internal', value: 'I am not an error object' },
      ]);
    });
    it('should pass ApplicationError directly to next without modification', () => {
      const appError = new ApplicationError('Already handled error', 400);

      orderController.handleError(appError, 'Failed operation', mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(appError);
    });
  });
});
