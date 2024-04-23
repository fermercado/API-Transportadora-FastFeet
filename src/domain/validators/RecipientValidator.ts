import { z } from 'zod';
import { CommonValidations } from '../../domain/validators/commonValidations';

export class RecipientValidator {
  static createSchema = z.object({
    firstName: CommonValidations.createNameValidation('First Name'),
    lastName: CommonValidations.createNameValidation('Last Name'),
    cpf: CommonValidations.createCpfValidation(),
    email: CommonValidations.createEmailValidation(),
    zipCode: CommonValidations.createZipCodeValidation(),
  });

  static updateSchema = RecipientValidator.createSchema.partial();
}
