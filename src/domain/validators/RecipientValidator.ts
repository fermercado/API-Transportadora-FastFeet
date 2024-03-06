import { z } from 'zod';
import { ExternalServices } from '../../infrastructure/externalService/ExternalService';
import CommonValidations from '../../domain/validators/commonValidations';

export class RecipientValidator {
  static createSchema = z.object({
    firstName: CommonValidations.createNameValidation('First Name'),
    lastName: CommonValidations.createNameValidation('Last Name'),
    cpf: CommonValidations.createCpfValidation(),
    email: CommonValidations.createEmailValidation(),
    zipCode: z
      .string()
      .regex(
        /^\d{5}-\d{3}$/,
        'ZIP code must be in the format XXXXX-XXX and cannot be empty.',
      )
      .refine(
        async (zipCode) => {
          try {
            await ExternalServices.getAddressByZipCode(zipCode);
            return true;
          } catch (error) {
            return false;
          }
        },
        { message: 'Invalid or not found ZIP code.' },
      ),
  });

  static updateSchema = RecipientValidator.createSchema.partial();
}
