import { container } from 'tsyringe';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { RecipientRepository } from '../orm/repositories/RecipientRepository';
import { RecipientService } from '../../application/services/RecipientService';
import { RecipientValidationService } from '../../domain/validation/RecipientValidationService';
import { RecipientMapper } from '../../application/mappers/RecipientMapper';

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
container.registerSingleton('RecipientMapper', RecipientMapper);

export { container } from 'tsyringe';
