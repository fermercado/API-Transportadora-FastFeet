import { OrderStatusMapper } from '../../../../application/mappers/OrderStatusMapper';
import { Order } from '../../../../domain/entities/Order';
import { OrderStatus } from '../../../../domain/enums/OrderStatus';
import { User } from '../../../../domain/entities/User';
import { Recipient } from '../../../../domain/entities/Recipient';
import { UserRole } from '../../../../domain/enums/UserRole';
import { DateUtils } from '../../../../infrastructure/shared/utils/dateUtils';

describe('OrderStatusMapper', () => {
  it('should correctly map the order status history and current status', () => {
    const recipient: Recipient = {
      id: '1',
      firstName: 'Maria',
      lastName: 'Silva',
      street: 'Rua A',
      number: 100,
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      zipCode: '12345-678',
      email: 'maria@example.com',
      cpf: '123.456.789-09',
      latitude: -23.561684,
      longitude: -46.656139,
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: new Date('2021-01-01T00:00:00.000Z'),
    };

    const deliveryman: User = {
      id: '2',
      firstName: 'João',
      lastName: 'Smith',
      email: 'joao.smith@example.com',
      cpf: '987.654.321-09',
      role: UserRole.Deliveryman,
      password: 'securePassword',
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      updatedAt: new Date('2021-01-01T00:00:00.000Z'),
    };

    const order: Order = {
      id: '1',
      trackingCode: 'TRACK123',
      recipient,
      deliveryman,
      status: OrderStatus.Delivered,
      createdAt: new Date('2021-01-01T00:00:00.000Z'),
      awaitingPickupAt: new Date('2021-01-02T00:00:00.000Z'),
      pickedUpAt: new Date('2021-01-03T00:00:00.000Z'),
      deliveredAt: new Date('2021-01-04T00:00:00.000Z'),
      returnedAt: undefined,
      deliveryPhoto: undefined,
      updatedAt: new Date('2021-01-04T00:00:00.000Z'),
    };

    const expected = {
      trackingCode: 'TRACK123',
      statusHistory: [
        {
          status: OrderStatus.Pending,
          message:
            'Sua encomenda foi recebida pela transportadora e está sendo processada.',
          date: DateUtils.formatToBrazilianDateTime(order.createdAt),
        },
        {
          status: OrderStatus.AwaitingPickup,
          message:
            'Sua encomenda está pronta para ser retirada pelo entregador.',
          date: DateUtils.formatToBrazilianDateTime(order.awaitingPickupAt),
        },
        {
          status: OrderStatus.PickedUp,
          message: 'Sua encomenda saiu para entrega.',
          date: DateUtils.formatToBrazilianDateTime(order.pickedUpAt),
        },
      ],
      currentStatus: {
        status: OrderStatus.Delivered,
        message: 'Sua encomenda foi entregue.',
        date: DateUtils.formatToBrazilianDateTime(order.deliveredAt),
      },
    };

    const result = OrderStatusMapper.toDto(order);
    expect(result).toEqual(expected);
  });
});
