import 'reflect-metadata';
import { CommonValidations } from '../../../../domain/validators/commonValidations';
import { z } from 'zod';
import { CepValidationProvider } from '../../../../infrastructure/providers/CepValidationProvider';
import { container } from 'tsyringe';

jest.mock('../../../../infrastructure/providers/CepValidationProvider');

describe('CommonValidations', () => {
  let cepValidationProviderMock: jest.Mocked<CepValidationProvider>;

  beforeEach(() => {
    cepValidationProviderMock = {
      getAddressByZipCode: jest.fn(),
      getCoordinatesFromAddress: jest.fn(),
    } as jest.Mocked<CepValidationProvider>;

    container.registerInstance(
      'CepValidationProvider',
      cepValidationProviderMock,
    );
    cepValidationProviderMock.getAddressByZipCode.mockImplementation(
      (zipCode) => {
        if (zipCode === '12345-678') {
          return Promise.reject(new Error('Invalid or not found ZIP code.'));
        }
        return Promise.resolve({
          logradouro: 'Rua Exemplo',
          bairro: 'Bairro Exemplo',
          localidade: 'Cidade Exemplo',
          uf: 'Estado Exemplo',
        });
      },
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    container.clearInstances();
  });

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
  });

  describe('createCpfValidation', () => {
    it('should fail validation for an invalid CPF format', () => {
      const schema = CommonValidations.createCpfValidation();
      const invalidCpf = '12345678909';
      expect(() => schema.parse(invalidCpf)).toThrow(z.ZodError);
    });
  });

  describe('createZipCodeValidation', () => {
    it('should pass validation for a valid ZIP code', async () => {
      const schema = CommonValidations.createZipCodeValidation(
        cepValidationProviderMock,
      );
      const validZipCode = '98765-432';
      await expect(schema.parseAsync(validZipCode)).resolves.not.toThrow();
    });

    it('should fail validation for a non-existent ZIP code', async () => {
      const schema = CommonValidations.createZipCodeValidation(
        cepValidationProviderMock,
      );
      const invalidZipCode = '12345-678';
      await expect(schema.parseAsync(invalidZipCode)).rejects.toThrow(
        z.ZodError,
      );
    });
  });
});
