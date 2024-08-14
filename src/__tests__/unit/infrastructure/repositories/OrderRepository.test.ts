import 'reflect-metadata';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from '../../../../domain/entities/Order';
import { OrderRepository } from '../../../../infrastructure/orm/repositories/OrderRepository';
import { OrderFilter } from '../../../../domain/interface/OrderFilter';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { User } from '../../../../domain/entities/User';
import { Recipient } from '../../../../domain/entities/Recipient';

jest.mock('typeorm', () => {
  const actualTypeOrm = jest.requireActual('typeorm');
  return {
    ...actualTypeOrm,
    DataSource: jest.fn(),
    Repository: jest.fn(),
    SelectQueryBuilder: jest.fn().mockImplementation(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };
});

describe('OrderRepository', () => {
  let orderRepository: OrderRepository;
  let mockRepository: jest.Mocked<Repository<Order>>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Order>>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
    } as any;

    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    orderRepository = new OrderRepository(mockDataSource);
  });

  const recipient: Recipient = {
    id: '1',
    firstName: 'Maria',
    lastName: 'Silva',
    email: 'maria.silva@example.com',
    cpf: '12345678900',
    zipCode: '12345-678',
    street: 'Street Name',
    number: '123',
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'State',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Recipient;

  const deliveryman: User = {
    id: '2',
    firstName: 'João',
    lastName: 'Smith',
    email: 'joao.smith@example.com',
    cpf: '98765432100',
    role: 'deliveryman',
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const orderData: Partial<Order> = {
    trackingCode: 'TRACK123',
    recipient,
    deliveryman,
    status: OrderStatus.Pending,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create an order', async () => {
    const createdOrder: Order = {
      ...orderData,
      id: '1',
    } as Order;

    mockRepository.create.mockReturnValue(createdOrder);
    mockRepository.save.mockResolvedValue(createdOrder);

    const result = await orderRepository.create(orderData);

    expect(mockRepository.create).toHaveBeenCalledWith(orderData);
    expect(mockRepository.save).toHaveBeenCalledWith(createdOrder);
    expect(result).toEqual(createdOrder);
  });

  it('should update an order', async () => {
    const order: Order = {
      id: '1',
      ...orderData,
    } as Order;
    const updatedOrder: Order = {
      ...order,
      status: OrderStatus.Delivered,
    };

    mockRepository.findOneBy.mockResolvedValue(order);
    mockRepository.save.mockResolvedValue(updatedOrder);

    const result = await orderRepository.update('1', {
      status: OrderStatus.Delivered,
    });

    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    expect(mockRepository.save).toHaveBeenCalledWith(updatedOrder);
    expect(result).toEqual(updatedOrder);
  });

  it('should throw an error if order not found on update', async () => {
    mockRepository.findOneBy.mockResolvedValue(undefined as any);

    await expect(
      orderRepository.update('1', { status: OrderStatus.Delivered }),
    ).rejects.toThrow('Order not found');
  });

  it('should find an order by ID', async () => {
    const order: Order = {
      id: '1',
      ...orderData,
    } as Order;

    mockRepository.findOne.mockResolvedValue(order);

    const result = await orderRepository.findById('1');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['recipient', 'deliveryman'],
    });
    expect(result).toEqual(order);
  });

  it('should return undefined if order not found by ID', async () => {
    mockRepository.findOne.mockResolvedValue(undefined as any);

    const result = await orderRepository.findById('1');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['recipient', 'deliveryman'],
    });
    expect(result).toBeUndefined();
  });

  it('should find orders by filter', async () => {
    const orders: Order[] = [
      {
        id: '1',
        ...orderData,
      } as Order,
    ];
    const filter: OrderFilter = {
      deliverymanId: '2',
      status: OrderStatus.Pending,
    };

    mockQueryBuilder.getMany.mockResolvedValue(orders);

    const result = await orderRepository.findByFilter(filter);

    expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('order');
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'order.recipient',
      'recipient',
    );
    expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'order.deliveryman',
      'deliveryman',
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'deliveryman.id = :deliverymanId',
      {
        deliverymanId: filter.deliverymanId,
      },
    );
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'order.status = :status',
      { status: filter.status },
    );
    expect(result).toEqual(orders);
  });

  it('should find all orders', async () => {
    const orders: Order[] = [
      {
        id: '1',
        ...orderData,
      } as Order,
    ];

    mockRepository.find.mockResolvedValue(orders);

    const result = await orderRepository.find();

    expect(mockRepository.find).toHaveBeenCalledWith({
      relations: ['recipient', 'deliveryman'],
    });
    expect(result).toEqual(orders);
  });

  it('should save an order', async () => {
    const order: Order = {
      id: '1',
      ...orderData,
    } as Order;

    mockRepository.save.mockResolvedValue(order);

    const result = await orderRepository.save(order);

    expect(mockRepository.save).toHaveBeenCalledWith(order);
    expect(result).toEqual(order);
  });

  it('should remove an order by ID', async () => {
    mockRepository.delete.mockResolvedValue({} as any);

    await orderRepository.remove('1');

    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });
  describe('findByTrackingCode', () => {
    it('should find an order by tracking code', async () => {
      const order = {
        ...orderData,
        id: '1',
        trackingCode: 'TRACK123',
      } as Order;
      mockRepository.findOne.mockResolvedValue(order);

      const result = await orderRepository.findByTrackingCode('TRACK123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { trackingCode: 'TRACK123' },
        relations: ['recipient', 'deliveryman'],
      });
      expect(result).toEqual(order);
    });

    it('should return null if no order is found with the provided tracking code', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result =
        await orderRepository.findByTrackingCode('NON_EXISTENT_CODE');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { trackingCode: 'NON_EXISTENT_CODE' },
        relations: ['recipient', 'deliveryman'],
      });
      expect(result).toBeNull();
    });
  });
});
