import 'reflect-metadata';
import { container } from 'tsyringe';
import { RecipientValidationService } from '../../../../domain/validationServices/RecipientValidationService';
import { UniqueValidationUtils } from '../../../../infrastructure/shared/utils/uniqueValidationUtils';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { CreateRecipientDto } from '../../../../application/dtos/recipient/CreateRecipientDto';
import { UpdateRecipientDto } from '../../../../application/dtos/recipient/UpdateRecipientDto';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IRecipientRepository } from '../../../../domain/repositories/IRecipientRepository';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { CepValidationProvider } from '../../../../infrastructure/providers/CepValidationProvider';

jest.mock('../../../../infrastructure/shared/utils/uniqueValidationUtils');
jest.mock('cpf-cnpj-validator', () => ({
  cpf: {
    isValid: jest.fn(),
  },
}));
jest.mock('../../../../infrastructure/providers/CepValidationProvider');

describe('RecipientValidationService', () => {
  let service: RecipientValidationService;
  let uniqueValidationUtilsMock: jest.Mocked<UniqueValidationUtils>;
  let userRepositoryMock: jest.Mocked<IUserRepository>;
  let recipientRepositoryMock: jest.Mocked<IRecipientRepository>;
  let cepValidationProviderMock: jest.Mocked<CepValidationProvider>;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
    } as any;

    recipientRepositoryMock = {
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
    } as any;

    uniqueValidationUtilsMock = new UniqueValidationUtils(
      userRepositoryMock,
      recipientRepositoryMock,
    ) as jest.Mocked<UniqueValidationUtils>;

    cepValidationProviderMock = {
      getAddressByZipCode: jest.fn().mockResolvedValue({
        logradouro: 'Rua Exemplo',
        bairro: 'Bairro Exemplo',
        localidade: 'Cidade Exemplo',
        uf: 'Estado Exemplo',
      }),
      getCoordinatesFromAddress: jest.fn().mockResolvedValue({
        latitude: 0,
        longitude: 0,
      }),
    } as jest.Mocked<CepValidationProvider>;

    container.registerInstance(
      'UniqueValidationUtils',
      uniqueValidationUtilsMock,
    );
    container.registerInstance(
      'CepValidationProvider',
      cepValidationProviderMock,
    );

    service = container.resolve(RecipientValidationService);

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateCreateData', () => {
    beforeEach(() => {
      (cpfValidator.isValid as jest.Mock).mockReturnValue(true);
    });

    it('should throw an error if validation fails', async () => {
      const invalidData: CreateRecipientDto = {
        email: 'invalid-email',
        cpf: 'invalid-cpf',
        zipCode: '12345',
        firstName: '',
        lastName: '',
        number: 0,
        complement: '',
      };

      await expect(service.validateCreateData(invalidData)).rejects.toThrow(
        ApplicationError,
      );
    });

    it('should call validateUniqueness if validation passes', async () => {
      const validData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-09',
        zipCode: '12345-678',
        firstName: 'João',
        lastName: 'Silva',
        number: 123,
        complement: 'Apt 1',
      };

      await service.validateCreateData(validData);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'recipient',
        undefined,
      );
      expect(uniqueValidationUtilsMock.checkUniqueCpf).toHaveBeenCalledWith(
        '123.456.789-09',
        'recipient',
        undefined,
      );
    });
  });

  describe('validateUpdateData', () => {
    beforeEach(() => {
      (cpfValidator.isValid as jest.Mock).mockReturnValue(true);
    });

    it('should throw an error if validation fails', async () => {
      const invalidData: UpdateRecipientDto = {
        email: 'invalid-email',
        cpf: 'invalid-cpf',
      };
      const recipientId = 'some-recipient-id';

      await expect(
        service.validateUpdateData(invalidData, recipientId),
      ).rejects.toThrow(ApplicationError);
    });

    it('should call validateUniqueness if validation passes', async () => {
      const validData: UpdateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-09',
      };
      const recipientId = 'some-recipient-id';

      await service.validateUpdateData(validData, recipientId);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'recipient',
        recipientId,
      );
      expect(uniqueValidationUtilsMock.checkUniqueCpf).toHaveBeenCalledWith(
        '123.456.789-09',
        'recipient',
        recipientId,
      );
    });
  });

  describe('validateUniqueness', () => {
    it('should call checkUniqueEmail and checkUniqueCpf if data has email and cpf', async () => {
      const data: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-09',
        zipCode: '12345-678',
        firstName: 'João',
        lastName: 'Silva',
        number: 123,
        complement: 'Apt 1',
      };

      await service.validateUniqueness(data);

      expect(uniqueValidationUtilsMock.checkUniqueEmail).toHaveBeenCalledWith(
        'test@example.com',
        'recipient',
        undefined,
      );
      expect(uniqueValidationUtilsMock.checkUniqueCpf).toHaveBeenCalledWith(
        '123.456.789-09',
        'recipient',
        undefined,
      );
    });
  });

  describe('validateZipCode', () => {
    it('should throw an error if zip code is not provided', async () => {
      await expect(service.validateZipCode('')).rejects.toThrow(
        ApplicationError,
      );
    });

    it('should not throw an error if zip code is provided', async () => {
      await expect(service.validateZipCode('12345-678')).resolves.not.toThrow();
    });
  });

  describe('validateAddressCompleteness', () => {
    beforeEach(() => {
      cepValidationProviderMock.getAddressByZipCode.mockResolvedValue({
        logradouro: 'Rua Exemplo',
        bairro: 'Bairro Exemplo',
        localidade: 'Cidade Exemplo',
        uf: 'Estado Exemplo',
      });
    });

    it('should throw an error if address information is incomplete', async () => {
      const addressInfo = {};
      const recipientData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-09',
        zipCode: '12345-678',
        firstName: 'João',
        lastName: 'Silva',
        number: 123,
        complement: 'Apt 1',
      };

      await expect(
        service.validateAddressCompleteness(addressInfo, recipientData),
      ).rejects.toThrow(ApplicationError);
    });

    it('should not throw an error if address information is complete', async () => {
      const addressInfo = {
        logradouro: 'Rua Exemplo',
        bairro: 'Bairro Exemplo',
        localidade: 'Cidade Exemplo',
        uf: 'Estado Exemplo',
      };
      const recipientData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-09',
        zipCode: '12345-678',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Rua Exemplo',
        neighborhood: 'Bairro Exemplo',
        city: 'Cidade Exemplo',
        state: 'Estado Exemplo',
        number: 123,
        complement: 'Apt 1',
      };

      await expect(
        service.validateAddressCompleteness(addressInfo, recipientData),
      ).resolves.not.toThrow();
    });
  });
});
