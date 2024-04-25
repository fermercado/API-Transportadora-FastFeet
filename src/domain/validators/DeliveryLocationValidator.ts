import { z } from 'zod';
import { CommonValidations } from '../../domain/validators/commonValidations';

export class DeliveryLocationValidator {
  static createSchema = z.object({
    zipCode: CommonValidations.createZipCodeValidation(),
  });
}
