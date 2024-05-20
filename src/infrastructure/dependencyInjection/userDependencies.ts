import { container } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserRepository } from '../orm/repositories/UserRepository';
import { UserService } from '../../application/services/UserService';
import { UserValidationService } from '../../domain/validation/UserValidationService';
import { UserMapper } from '../../application/mappers/UserMappers';

container.registerSingleton<IUserRepository>('IUserRepository', UserRepository);
container.registerSingleton<UserService>('UserService', UserService);
container.registerSingleton<UserValidationService>(
  'UserValidationService',
  UserValidationService,
);
container.registerSingleton('UserMapper', UserMapper);

export { container } from 'tsyringe';
