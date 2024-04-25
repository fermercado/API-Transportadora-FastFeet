import { container } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { UserService } from '../../application/services/UserService';
import { UserValidationService } from '../../application/validation/UserValidationService';

container.registerSingleton<IUserRepository>('IUserRepository', UserRepository);
container.registerSingleton<UserService>('UserService', UserService);
container.registerSingleton<UserValidationService>(
  'UserValidationService',
  UserValidationService,
);

export { container } from 'tsyringe';
