import { container } from 'tsyringe';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { OrderRepository } from '../orm/repositories/OrderRepository';
import { OrderService } from '../../application/services/OrderService';
import { OrderValidationService } from '../../domain/validationServices/OrderValidationService';
import { OrderMapper } from '../../application/mappers/OrderMapper';

container.registerSingleton<IOrderRepository>(
  'IOrderRepository',
  OrderRepository,
);
container.registerSingleton<OrderService>('OrderService', OrderService);
container.registerSingleton<OrderValidationService>(
  'OrderValidationService',
  OrderValidationService,
);
container.registerSingleton('OrderMapper', OrderMapper);

export { container } from 'tsyringe';
