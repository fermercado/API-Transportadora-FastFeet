import { z } from 'zod';
import { CommonValidations } from './commonValidations';

export class UserValidator {
  static createBaseSchema() {
    return z.object({
      cpf: CommonValidations.createCpfValidation(),
      firstName: CommonValidations.createNameValidation('First Name'),
      lastName: CommonValidations.createNameValidation('Last Name'),
      password: CommonValidations.createPasswordValidation(),
      role: z.union([z.literal('admin'), z.literal('deliveryman')]),
      email: CommonValidations.createEmailValidation(),
    });
  }

  public static get validateCreateUser() {
    return UserValidator.createBaseSchema()
      .extend({
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords don t match',
        path: ['confirmPassword'],
      });
  }

  public static get validateUpdateUser() {
    return UserValidator.createBaseSchema()
      .partial()
      .extend({
        confirmPassword: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.password) {
            return (
              data.confirmPassword && data.password === data.confirmPassword
            );
          }
          return true;
        },
        {
          message: 'Passwords don t match',
          path: ['confirmPassword'],
        },
      )
      .refine(
        (data) => {
          const isEmpty = Object.values(data).some(
            (value) => typeof value === 'string' && value.trim() === '',
          );
          return !isEmpty;
        },
        {
          message: 'Fields provided cannot be empty',
        },
      );
  }
}
