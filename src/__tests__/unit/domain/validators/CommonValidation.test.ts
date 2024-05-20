import { CommonValidations } from '../../../../domain/validators/commonValidations';
import { z } from 'zod';
import { ExternalServices } from '../../../../infrastructure/externalService/ExternalService';

jest.mock('../../../../infrastructure/externalService/ExternalService', () => ({
  ExternalServices: {
    getAddressByZipCode: jest.fn(),
  },
}));

describe('CommonValidations', () => {
  describe('createNameValidation', () => {
    it('should pass validation for a valid name', () => {
      const schema = CommonValidations.createNameValidation('Name');
      const validName = 'João Silva';

      expect(() => schema.parse(validName)).not.toThrow();
    });

    it('should fail validation for an empty name', () => {
      const schema = CommonValidations.createNameValidation('Name');

      expect(() => schema.parse('')).toThrow(z.ZodError);
    });

    it('should fail validation for a name with special characters', () => {
      const schema = CommonValidations.createNameValidation('Name');
      const invalidName = 'João@Silva';

      expect(() => schema.parse(invalidName)).toThrow(z.ZodError);
    });
  });

  describe('createEmailValidation', () => {
    it('should pass validation for a valid email', () => {
      const schema = CommonValidations.createEmailValidation();
      const validEmail = 'joao.silva@example.com';

      expect(() => schema.parse(validEmail)).not.toThrow();
    });

    it('should fail validation for an invalid email', () => {
      const schema = CommonValidations.createEmailValidation();
      const invalidEmail = 'joao.silva@com';

      expect(() => schema.parse(invalidEmail)).toThrow(z.ZodError);
    });
  });

  describe('createPasswordValidation', () => {
    it('should pass validation for a valid password', () => {
      const schema = CommonValidations.createPasswordValidation();
      const validPassword = 'Password1!';

      expect(() => schema.parse(validPassword)).not.toThrow();
    });

    it('should fail validation for a password without uppercase letters', () => {
      const schema = CommonValidations.createPasswordValidation();
      const invalidPassword = 'password1!';

      expect(() => schema.parse(invalidPassword)).toThrow(z.ZodError);
    });

    it('should fail validation for a password without numbers', () => {
      const schema = CommonValidations.createPasswordValidation();
      const invalidPassword = 'Password!';

      expect(() => schema.parse(invalidPassword)).toThrow(z.ZodError);
    });

    it('should fail validation for a password without special characters', () => {
      const schema = CommonValidations.createPasswordValidation();
      const invalidPassword = 'Password1';

      expect(() => schema.parse(invalidPassword)).toThrow(z.ZodError);
    });

    it('should fail validation for a short password', () => {
      const schema = CommonValidations.createPasswordValidation();
      const invalidPassword = 'Pwd1!';

      expect(() => schema.parse(invalidPassword)).toThrow(z.ZodError);
    });
  });

  describe('createCpfValidation', () => {
    it('should fail validation for an invalid CPF format', () => {
      const schema = CommonValidations.createCpfValidation();
      const invalidCpf = '12345678909';

      expect(() => schema.parse(invalidCpf)).toThrow(z.ZodError);
    });

    it('should fail validation for an invalid CPF number', () => {
      const schema = CommonValidations.createCpfValidation();
      const invalidCpf = '123.456.789-00';

      expect(() => schema.parse(invalidCpf)).toThrow(z.ZodError);
    });
  });

  describe('createZipCodeValidation', () => {
    it('should pass validation for a valid ZIP code', async () => {
      const schema = CommonValidations.createZipCodeValidation();
      const validZipCode = '12345-678';

      (ExternalServices.getAddressByZipCode as jest.Mock).mockResolvedValue(
        true,
      );

      await expect(schema.parseAsync(validZipCode)).resolves.not.toThrow();
    });

    it('should fail validation for an invalid ZIP code format', async () => {
      const schema = CommonValidations.createZipCodeValidation();
      const invalidZipCode = '12345678';

      await expect(schema.parseAsync(invalidZipCode)).rejects.toThrow(
        z.ZodError,
      );
    });

    it('should fail validation for a non-existent ZIP code', async () => {
      const schema = CommonValidations.createZipCodeValidation();
      const invalidZipCode = '12345-678';

      (ExternalServices.getAddressByZipCode as jest.Mock).mockRejectedValue(
        new Error('Invalid or not found ZIP code.'),
      );

      await expect(schema.parseAsync(invalidZipCode)).rejects.toThrow(
        z.ZodError,
      );
    });
  });
});
