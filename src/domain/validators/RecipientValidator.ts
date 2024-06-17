import { z } from 'zod';
import { CommonValidations } from '../../domain/validators/commonValidations';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

export class RecipientValidator {
  static createSchema = (cepValidationProvider: CepValidationProvider) =>
    z
      .object({
        firstName: CommonValidations.createNameValidation('First Name'),
        lastName: CommonValidations.createNameValidation('Last Name'),
        cpf: CommonValidations.createCpfValidation(),
        email: CommonValidations.createEmailValidation(),
        zipCode: CommonValidations.createZipCodeValidation(
          cepValidationProvider,
        ),
        number: z.number().refine((num) => num > 0, {
          message: 'Number must be a positive integer',
        }),
        street: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        complement: z.string(),
      })
      .strict();

  static updateSchema = (cepValidationProvider: CepValidationProvider) =>
    z
      .object({
        firstName:
          CommonValidations.createNameValidation('First Name').optional(),
        lastName:
          CommonValidations.createNameValidation('Last Name').optional(),
        cpf: CommonValidations.createCpfValidation().optional(),
        email: CommonValidations.createEmailValidation().optional(),
        zipCode: CommonValidations.createZipCodeValidation(
          cepValidationProvider,
        ).optional(),
        number: z
          .number()
          .optional()
          .refine((num) => num === undefined || num > 0, {
            message: 'Number must be a positive integer or omitted',
          }),
        complement: z.string().optional(),
        street: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
      .strict();
}
