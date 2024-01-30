import { container } from 'tsyringe';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { UserService } from './application/services/UserService';

import { IDeliverymanRepository } from './domain/repositories/IDeliverymanRepository';
import { DeliverymanRepository } from './infrastructure/repositories/DeliverymanRepository';
import { DeliverymanService } from './application/services/DeliverymanService';

import { IOrderRepository } from './domain/repositories/IOrderRepository';
import { OrderRepository } from './infrastructure/repositories/OrderRepository';
import { OrderService } from './application/services/OrderService';

import { IRecipientRepository } from './domain/repositories/IRecipientRepository';
import { RecipientRepository } from './infrastructure/repositories/RecipientRepository';
import { RecipientService } from './application/services/RecipientService';

import { AuthService } from './application/services/AuthService';

container.registerSingleton<IUserRepository>('IUserRepository', UserRepository);
container.registerSingleton<UserService>('UserService', UserService);

container.registerSingleton<IDeliverymanRepository>(
  'IDeliverymanRepository',
  DeliverymanRepository,
);
container.registerSingleton<DeliverymanService>(
  'DeliverymanService',
  DeliverymanService,
);

container.registerSingleton<IOrderRepository>(
  'IOrderRepository',
  OrderRepository,
);
container.registerSingleton<OrderService>('OrderService', OrderService);

container.registerSingleton<IRecipientRepository>(
  'IRecipientRepository',
  RecipientRepository,
);
container.registerSingleton<RecipientService>(RecipientService);

container.registerSingleton('AuthService', AuthService);

export { container };
