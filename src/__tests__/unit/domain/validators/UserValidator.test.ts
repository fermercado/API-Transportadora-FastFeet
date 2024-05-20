import { UserValidator } from '../../../../domain/validators/UserValidator';
import { z } from 'zod';
import { UserRole } from '../../../../domain/enums/UserRole';

describe('UserValidator', () => {
  describe('validateCreateUser', () => {
    it('should pass validation for a valid user', () => {
      const validUser = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() =>
        UserValidator.validateCreateUser.parse(validUser),
      ).not.toThrow();
    });

    it('should fail validation if passwords do not match', () => {
      const invalidUser = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password2!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() => UserValidator.validateCreateUser.parse(invalidUser)).toThrow(
        z.ZodError,
      );
    });

    it('should fail validation for an invalid CPF format', () => {
      const invalidUser = {
        cpf: '123.456.789-09',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() => UserValidator.validateCreateUser.parse(invalidUser)).toThrow(
        z.ZodError,
      );
    });

    it('should fail validation for an invalid email format', () => {
      const invalidUser = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@com',
      };

      expect(() => UserValidator.validateCreateUser.parse(invalidUser)).toThrow(
        z.ZodError,
      );
    });
  });

  describe('validateUpdateUser', () => {
    it('should pass validation for a valid user update', () => {
      const validUserUpdate = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() =>
        UserValidator.validateUpdateUser.parse(validUserUpdate),
      ).not.toThrow();
    });

    it('should fail validation if passwords do not match in update', () => {
      const invalidUserUpdate = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password2!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() =>
        UserValidator.validateUpdateUser.parse(invalidUserUpdate),
      ).toThrow(z.ZodError);
    });

    it('should pass validation if password is not provided in update', () => {
      const validUserUpdate = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() =>
        UserValidator.validateUpdateUser.parse(validUserUpdate),
      ).not.toThrow();
    });

    it('should fail validation for an invalid CPF format in update', () => {
      const invalidUserUpdate = {
        cpf: '123.456.789-09',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@example.com',
      };

      expect(() =>
        UserValidator.validateUpdateUser.parse(invalidUserUpdate),
      ).toThrow(z.ZodError);
    });

    it('should fail validation for an invalid email format in update', () => {
      const invalidUserUpdate = {
        cpf: '674.155.870-57',
        firstName: 'João',
        lastName: 'Silva',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: UserRole.Admin,
        email: 'joao.silva@com',
      };

      expect(() =>
        UserValidator.validateUpdateUser.parse(invalidUserUpdate),
      ).toThrow(z.ZodError);
    });
  });
});
