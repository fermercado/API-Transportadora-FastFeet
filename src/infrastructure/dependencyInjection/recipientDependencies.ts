import { container } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { RecipientRepository } from '../../infrastructure/repositories/RecipientRepository';
import { RecipientService } from '../../application/services/RecipientService';
import { RecipientValidationService } from '../../application/validation/RecipientValidationService';

container.registerSingleton<IRecipientRepository>(
  'IRecipientRepository',
  RecipientRepository,
);
container.registerSingleton<RecipientService>(
  'RecipientService',
  RecipientService,
);
container.registerSingleton(
  'RecipientValidationService',
  RecipientValidationService,
);
container.registerSingleton;

export { container } from 'tsyringe';
