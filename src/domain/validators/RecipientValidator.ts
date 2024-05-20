import { z } from 'zod';
import { CommonValidations } from '../../domain/validators/commonValidations';

export class RecipientValidator {
  static createSchema = z
    .object({
      firstName: CommonValidations.createNameValidation('First Name'),
      lastName: CommonValidations.createNameValidation('Last Name'),
      cpf: CommonValidations.createCpfValidation(),
      email: CommonValidations.createEmailValidation(),
      zipCode: CommonValidations.createZipCodeValidation(),
      number: z.number().refine((num) => num > 0, {
        message: 'Number must be a positive integer',
      }),
      complement: z.string(),
    })
    .strict();

  static updateSchema = z
    .object({
      firstName:
        CommonValidations.createNameValidation('First Name').optional(),
      lastName: CommonValidations.createNameValidation('Last Name').optional(),
      cpf: CommonValidations.createCpfValidation().optional(),
      email: CommonValidations.createEmailValidation().optional(),
      zipCode: CommonValidations.createZipCodeValidation().optional(),
      number: z
        .number()
        .optional()
        .refine((num) => num === undefined || num > 0, {
          message: 'Number must be a positive integer or omitted',
        }),
      complement: z.string().optional(),
    })
    .strict();
}
