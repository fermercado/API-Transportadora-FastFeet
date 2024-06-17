import { container } from 'tsyringe';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import AppDataSource from '../../infrastructure/orm/ormconfig';
import { AuthService } from '../../application/services/AuthService';
import { UserService } from '../../application/services/UserService';
import { DeliveryNotificationService } from '../../application/services/DeliveryNotificationService';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';
import { UniqueValidationUtils } from '../../infrastructure/shared/utils/uniqueValidationUtils';
import { PasswordHasher } from '../../infrastructure/shared/utils/PasswordHasher';
import { UserValidationService } from '../../domain/validationServices/UserValidationService';
import { UserMapper } from '../../application/mappers/UserMappers';

const jwtSecret = process.env.JWT_SECRET || 'default_secret';

container.register('JWT_SECRET', { useValue: jwtSecret });

container.registerSingleton('AuthService', AuthService);
container.registerSingleton('UserService', UserService);
container.registerSingleton(
  'DeliveryNotificationService',
  DeliveryNotificationService,
);
container.registerSingleton<CepValidationProvider>(
  'CepValidationProvider',
  CepValidationProvider,
);
container.registerSingleton('UniqueValidationUtils', UniqueValidationUtils);
container.registerSingleton('PasswordHasher', PasswordHasher);
container.registerSingleton('UserValidationService', UserValidationService);
container.registerSingleton('UserMapper', UserMapper);

container.registerInstance<DataSource>('DataSource', AppDataSource);

export { container };
