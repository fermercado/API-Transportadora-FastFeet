import { z } from 'zod';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';

export class CommonValidations {
  static createNameValidation(fieldName: string) {
    return z
      .string()
      .min(1, `${fieldName} cannot be empty`)
      .max(20, `${fieldName} must be at most 20 characters`)
      .regex(
        /^[a-zA-Z\u00C0-\u00FF ',-.]*$/,
        `${fieldName} must not contain numbers or special characters`,
      );
  }

  static createEmailValidation() {
    return z.string().email('Invalid email format');
  }

  static createPasswordValidation() {
    return z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{6,}$/,
        'Password must include at least one uppercase letter, one number, and one special character',
      );
  }

  static createCpfValidation() {
    return z
      .string()
      .refine(
        (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf),
        'CPF must be in the format xxx.xxx.xxx-xx',
      )
      .refine((cpf) => cpfValidator.isValid(cpf), 'Invalid CPF');
  }

  static createZipCodeValidation(cepValidationProvider: CepValidationProvider) {
    return z
      .string()
      .regex(/^\d{5}-\d{3}$/, 'ZIP code must be in the format XXXXX-XXX')
      .refine(
        async (zipCode) => {
          try {
            await cepValidationProvider.getAddressByZipCode(zipCode);
            return true;
          } catch (error) {
            return false;
          }
        },
        { message: 'Invalid or not found ZIP code.', path: [] },
      );
  }
}
