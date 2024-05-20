import { Order } from '../../../../domain/entities/Order';
import { Recipient } from '../../../../domain/entities/Recipient';
import { User } from '../../../../domain/entities/User';
import { OrderResponseDto } from '../../../../application/dtos/order/ResponseOrderDto';
import { OrderMapper } from '../../../../application/mappers/OrderMapper';
import { DateUtils } from '../../../../application/utils/dateUtils';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { UserRole } from '../../../../domain/enums/UserRole';

jest.mock('../../../../application/utils/dateUtils', () => ({
  DateUtils: {
    formatToBrazilianDateTime: jest.fn((date) =>
      date ? 'formatted date' : '',
    ),
  },
}));

describe('OrderMapper', () => {
  let orderMapper: OrderMapper;

  beforeEach(() => {
    jest.clearAllMocks();
    orderMapper = new OrderMapper();
  });

  it('should map Order to OrderResponseDto correctly', () => {
    const order = new Order();
    order.id = '1';
    order.trackingCode = 'TRACK123';
    order.status = OrderStatus.Pending;
    order.deliveryPhoto = 'photo.png';
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.awaitingPickupAt = new Date();
    order.pickedUpAt = new Date();
    order.deliveredAt = new Date();
    order.returnedAt = new Date();

    order.recipient = new Recipient();
    order.recipient.id = '2';
    order.recipient.firstName = 'Maria';
    order.recipient.lastName = 'Silva';
    order.recipient.email = 'maria.silva@example.com';
    order.recipient.cpf = '123.456.789-00';
    order.recipient.zipCode = '12345-678';
    order.recipient.street = 'Main St';
    order.recipient.number = 123;
    order.recipient.complement = 'Apt 4B';
    order.recipient.neighborhood = 'Downtown';
    order.recipient.city = 'Metropolis';
    order.recipient.state = 'NY';
    order.recipient.latitude = 40.7128;
    order.recipient.longitude = -74.006;

    order.deliveryman = new User();
    order.deliveryman.id = '3';
    order.deliveryman.firstName = 'João';
    order.deliveryman.lastName = 'Silva';
    order.deliveryman.email = 'joao.silva@example.com';
    order.deliveryman.cpf = '987.654.321-00';
    order.deliveryman.role = UserRole.Deliveryman;

    const orderResponseDto: OrderResponseDto = orderMapper.toDto(order);

    expect(orderResponseDto).toEqual({
      id: '1',
      trackingCode: 'TRACK123',
      status: OrderStatus.Pending,
      deliveryPhoto: 'photo.png',
      createdAt: 'formatted date',
      updatedAt: 'formatted date',
      awaitingPickupAt: 'formatted date',
      pickedUpAt: 'formatted date',
      deliveredAt: 'formatted date',
      returnedAt: 'formatted date',
      recipient: {
        id: '2',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-00',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: 'Apt 4B',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
      deliveryman: {
        id: '3',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        cpf: '987.654.321-00',
        role: UserRole.Deliveryman,
      },
    });

    expect(DateUtils.formatToBrazilianDateTime).toHaveBeenCalledTimes(6);
  });

  it('should map Order to OrderResponseDto correctly with undefined deliveryman', () => {
    const order = new Order();
    order.id = '1';
    order.trackingCode = 'TRACK123';
    order.status = OrderStatus.Pending;
    order.deliveryPhoto = 'photo.png';
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.awaitingPickupAt = new Date();
    order.pickedUpAt = new Date();
    order.deliveredAt = new Date();
    order.returnedAt = new Date();

    order.recipient = new Recipient();
    order.recipient.id = '2';
    order.recipient.firstName = 'Maria';
    order.recipient.lastName = 'Silva';
    order.recipient.email = 'maria.silva@example.com';
    order.recipient.cpf = '123.456.789-00';
    order.recipient.zipCode = '12345-678';
    order.recipient.street = 'Main St';
    order.recipient.number = 123;
    order.recipient.complement = 'Apt 4B';
    order.recipient.neighborhood = 'Downtown';
    order.recipient.city = 'Metropolis';
    order.recipient.state = 'NY';
    order.recipient.latitude = 40.7128;
    order.recipient.longitude = -74.006;

    order.deliveryman = undefined;

    const orderResponseDto: OrderResponseDto = orderMapper.toDto(order);

    expect(orderResponseDto).toEqual({
      id: '1',
      trackingCode: 'TRACK123',
      status: OrderStatus.Pending,
      deliveryPhoto: 'photo.png',
      createdAt: 'formatted date',
      updatedAt: 'formatted date',
      awaitingPickupAt: 'formatted date',
      pickedUpAt: 'formatted date',
      deliveredAt: 'formatted date',
      returnedAt: 'formatted date',
      recipient: {
        id: '2',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-00',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: 'Apt 4B',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
      deliveryman: undefined,
    });

    expect(DateUtils.formatToBrazilianDateTime).toHaveBeenCalledTimes(6);
  });

  it('should map Order to OrderResponseDto correctly with recipient complement as undefined', () => {
    const order = new Order();
    order.id = '1';
    order.trackingCode = 'TRACK123';
    order.status = OrderStatus.Pending;
    order.deliveryPhoto = 'photo.png';
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.awaitingPickupAt = new Date();
    order.pickedUpAt = new Date();
    order.deliveredAt = new Date();
    order.returnedAt = new Date();

    order.recipient = new Recipient();
    order.recipient.id = '2';
    order.recipient.firstName = 'Maria';
    order.recipient.lastName = 'Silva';
    order.recipient.email = 'maria.silva@example.com';
    order.recipient.cpf = '123.456.789-00';
    order.recipient.zipCode = '12345-678';
    order.recipient.street = 'Main St';
    order.recipient.number = 123;
    order.recipient.complement = undefined;
    order.recipient.neighborhood = 'Downtown';
    order.recipient.city = 'Metropolis';
    order.recipient.state = 'NY';
    order.recipient.latitude = 40.7128;
    order.recipient.longitude = -74.006;

    order.deliveryman = new User();
    order.deliveryman.id = '3';
    order.deliveryman.firstName = 'João';
    order.deliveryman.lastName = 'Silva';
    order.deliveryman.email = 'joao.silva@example.com';
    order.deliveryman.cpf = '987.654.321-00';
    order.deliveryman.role = UserRole.Deliveryman;

    const orderResponseDto: OrderResponseDto = orderMapper.toDto(order);

    expect(orderResponseDto).toEqual({
      id: '1',
      trackingCode: 'TRACK123',
      status: OrderStatus.Pending,
      deliveryPhoto: 'photo.png',
      createdAt: 'formatted date',
      updatedAt: 'formatted date',
      awaitingPickupAt: 'formatted date',
      pickedUpAt: 'formatted date',
      deliveredAt: 'formatted date',
      returnedAt: 'formatted date',
      recipient: {
        id: '2',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-00',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: '',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
      deliveryman: {
        id: '3',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        cpf: '987.654.321-00',
        role: UserRole.Deliveryman,
      },
    });

    expect(DateUtils.formatToBrazilianDateTime).toHaveBeenCalledTimes(6);
  });

  it('should map Order to OrderResponseDto correctly with empty recipient complement', () => {
    const order = new Order();
    order.id = '1';
    order.trackingCode = 'TRACK123';
    order.status = OrderStatus.Pending;
    order.deliveryPhoto = 'photo.png';
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.awaitingPickupAt = new Date();
    order.pickedUpAt = new Date();
    order.deliveredAt = new Date();
    order.returnedAt = new Date();

    order.recipient = new Recipient();
    order.recipient.id = '2';
    order.recipient.firstName = 'Maria';
    order.recipient.lastName = 'Silva';
    order.recipient.email = 'maria.silva@example.com';
    order.recipient.cpf = '123.456.789-00';
    order.recipient.zipCode = '12345-678';
    order.recipient.street = 'Main St';
    order.recipient.number = 123;
    order.recipient.complement = '';
    order.recipient.neighborhood = 'Downtown';
    order.recipient.city = 'Metropolis';
    order.recipient.state = 'NY';
    order.recipient.latitude = 40.7128;
    order.recipient.longitude = -74.006;

    order.deliveryman = new User();
    order.deliveryman.id = '3';
    order.deliveryman.firstName = 'João';
    order.deliveryman.lastName = 'Silva';
    order.deliveryman.email = 'joao.silva@example.com';
    order.deliveryman.cpf = '987.654.321-00';
    order.deliveryman.role = UserRole.Deliveryman;

    const orderResponseDto: OrderResponseDto = orderMapper.toDto(order);

    expect(orderResponseDto).toEqual({
      id: '1',
      trackingCode: 'TRACK123',
      status: OrderStatus.Pending,
      deliveryPhoto: 'photo.png',
      createdAt: 'formatted date',
      updatedAt: 'formatted date',
      awaitingPickupAt: 'formatted date',
      pickedUpAt: 'formatted date',
      deliveredAt: 'formatted date',
      returnedAt: 'formatted date',
      recipient: {
        id: '2',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-00',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: '',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
      deliveryman: {
        id: '3',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        cpf: '987.654.321-00',
        role: UserRole.Deliveryman,
      },
    });

    expect(DateUtils.formatToBrazilianDateTime).toHaveBeenCalledTimes(6);
  });

  it('should map Order to OrderResponseDto correctly with recipient and all properties', () => {
    const order = new Order();
    order.id = '1';
    order.trackingCode = 'TRACK123';
    order.status = OrderStatus.Pending;
    order.deliveryPhoto = 'photo.png';
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.awaitingPickupAt = new Date();
    order.pickedUpAt = new Date();
    order.deliveredAt = new Date();
    order.returnedAt = new Date();

    order.recipient = new Recipient();
    order.recipient.id = '2';
    order.recipient.firstName = 'Maria';
    order.recipient.lastName = 'Silva';
    order.recipient.email = 'maria.silva@example.com';
    order.recipient.cpf = '123.456.789-00';
    order.recipient.zipCode = '12345-678';
    order.recipient.street = 'Main St';
    order.recipient.number = 123;
    order.recipient.complement = 'Apt 4B';
    order.recipient.neighborhood = 'Downtown';
    order.recipient.city = 'Metropolis';
    order.recipient.state = 'NY';
    order.recipient.latitude = 40.7128;
    order.recipient.longitude = -74.006;

    order.deliveryman = new User();
    order.deliveryman.id = '3';
    order.deliveryman.firstName = 'João';
    order.deliveryman.lastName = 'Silva';
    order.deliveryman.email = 'joao.silva@example.com';
    order.deliveryman.cpf = '987.654.321-00';
    order.deliveryman.role = UserRole.Deliveryman;

    const orderResponseDto: OrderResponseDto = orderMapper.toDto(order);

    expect(orderResponseDto).toEqual({
      id: '1',
      trackingCode: 'TRACK123',
      status: OrderStatus.Pending,
      deliveryPhoto: 'photo.png',
      createdAt: 'formatted date',
      updatedAt: 'formatted date',
      awaitingPickupAt: 'formatted date',
      pickedUpAt: 'formatted date',
      deliveredAt: 'formatted date',
      returnedAt: 'formatted date',
      recipient: {
        id: '2',
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria.silva@example.com',
        cpf: '123.456.789-00',
        zipCode: '12345-678',
        street: 'Main St',
        number: 123,
        complement: 'Apt 4B',
        neighborhood: 'Downtown',
        city: 'Metropolis',
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
      },
      deliveryman: {
        id: '3',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        cpf: '987.654.321-00',
        role: UserRole.Deliveryman,
      },
    });

    expect(DateUtils.formatToBrazilianDateTime).toHaveBeenCalledTimes(6);
  });
});
