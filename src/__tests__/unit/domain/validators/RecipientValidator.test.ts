import 'reflect-metadata';
import { z } from 'zod';
import { CepValidationProvider } from '../../../../infrastructure/providers/CepValidationProvider';
import { RecipientValidator } from '../../../../domain/validators/RecipientValidator';
import { container } from 'tsyringe';

jest.mock('../../../../infrastructure/providers/CepValidationProvider');

describe('RecipientValidator', () => {
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

  describe('createSchema', () => {
    it('should fail validation for an invalid ZIP code', async () => {
      const schema = RecipientValidator.createSchema(cepValidationProviderMock);
      const invalidRecipient = {
        firstName: 'João',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'joao.silva@example.com',
        zipCode: '12345-678',
        number: 123,
        street: 'Rua Exemplo',
        neighborhood: 'Bairro Exemplo',
        city: 'Cidade Exemplo',
        state: 'Estado Exemplo',
        complement: 'Apto 123',
      };
      await expect(schema.parseAsync(invalidRecipient)).rejects.toThrow(
        z.ZodError,
      );
    });
  });

  describe('updateSchema', () => {
    it('should pass validation for a valid recipient update', async () => {
      const schema = RecipientValidator.updateSchema(cepValidationProviderMock);
      const validUpdate = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        zipCode: '98765-432',
        number: 123,
      };
      await expect(schema.parseAsync(validUpdate)).resolves.not.toThrow();
    });

    it('should fail validation for an invalid ZIP code update', async () => {
      const schema = RecipientValidator.updateSchema(cepValidationProviderMock);
      const invalidUpdate = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@example.com',
        zipCode: '12345-678',
        number: 123,
      };
      await expect(schema.parseAsync(invalidUpdate)).rejects.toThrow(
        z.ZodError,
      );
    });
  });
});
