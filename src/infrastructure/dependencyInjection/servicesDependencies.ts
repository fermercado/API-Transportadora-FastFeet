import { container } from 'tsyringe';
import { AuthService } from '../../application/services/AuthService';
import { DeliveryNotificationService } from '../../application/services/DeliveryNotificationService';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import { UniqueValidationUtils } from '../../shared/utils/uniqueValidationUtils';

container.registerSingleton('AuthService', AuthService);
container.registerSingleton(
  'DeliveryNotificationService',
  DeliveryNotificationService,
);
container.registerSingleton('ExternalServices', ExternalServices);
container.registerSingleton('UniqueValidationUtils', UniqueValidationUtils);

export { container } from 'tsyringe';
