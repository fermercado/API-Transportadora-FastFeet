import { z } from 'zod';
import { CommonValidations } from '../../domain/validators/commonValidations';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

export class DeliveryLocationValidator {
  static createSchema = (cepValidationProvider: CepValidationProvider) =>
    z.object({
      zipCode: CommonValidations.createZipCodeValidation(cepValidationProvider),
    });
}
