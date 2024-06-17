import 'reflect-metadata';
import { RecipientService } from '../../../../application/services/RecipientService';
import { IRecipientRepository } from '../../../../domain/repositories/IRecipientRepository';
import { RecipientValidationService } from '../../../../domain/validationServices/RecipientValidationService';
import { RecipientMapper } from '../../../../application/mappers/RecipientMapper';
import { CreateRecipientDto } from '../../../../application/dtos/recipient/CreateRecipientDto';
import { Recipient } from '../../../../domain/entities/Recipient';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { CepValidationProvider } from '../../../../infrastructure/providers/CepValidationProvider';
import { container } from 'tsyringe';

jest.mock('../../../../domain/repositories/IRecipientRepository');
jest.mock('../../../../domain/validationServices/RecipientValidationService');
jest.mock('../../../../application/mappers/RecipientMapper');
jest.mock('../../../../infrastructure/providers/CepValidationProvider');

describe('RecipientService', () => {
  let recipientService: RecipientService;
  let recipientRepository: jest.Mocked<IRecipientRepository>;
  let recipientValidationService: jest.Mocked<RecipientValidationService>;
  let recipientMapper: jest.Mocked<RecipientMapper>;
  let cepValidationProvider: jest.Mocked<CepValidationProvider>;

  beforeEach(() => {
    recipientRepository = {
      create: jest.fn().mockResolvedValue(new Recipient()),
      update: jest
        .fn()
        .mockImplementation((id, data) => Promise.resolve({ ...data, id })),
      findById: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findByZipCode: jest.fn(),
      find: jest.fn(),
    } as jest.Mocked<IRecipientRepository>;

    recipientValidationService = {
      validateCreateData: jest.fn().mockResolvedValue(undefined),
      validateUniqueness: jest.fn().mockResolvedValue(undefined),
      validateUpdateData: jest.fn().mockResolvedValue(undefined),
      validateZipCode: jest.fn().mockResolvedValue(undefined),
      validateAddressCompleteness: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RecipientValidationService>;

    recipientMapper = new RecipientMapper() as jest.Mocked<RecipientMapper>;
    recipientMapper.toDto.mockReturnValue({
      id: '1',
      email: 'test@example.com',
      firstName: 'João',
      lastName: 'Silva',
      street: '123 Main St',
      number: 100,
      cpf: '000.000.000-00',
      complement: 'Apt 101',
      neighborhood: 'Central',
      city: 'TestCity',
      state: 'TS',
      zipCode: '12345',
      latitude: 10,
      longitude: 20,
    });

    cepValidationProvider =
      new CepValidationProvider() as jest.Mocked<CepValidationProvider>;
    cepValidationProvider.getAddressByZipCode.mockResolvedValue({
      logradouro: 'Test Street',
      bairro: 'Test Neighborhood',
      localidade: 'Test City',
      uf: 'TS',
      latitude: 10,
      longitude: 20,
    });
    cepValidationProvider.getCoordinatesFromAddress.mockResolvedValue({
      latitude: 10,
      longitude: 20,
    });

    container.clearInstances();
    container.registerInstance('IRecipientRepository', recipientRepository);
    container.registerInstance(
      'RecipientValidationService',
      recipientValidationService,
    );
    container.registerInstance('RecipientMapper', recipientMapper);
    container.registerInstance('CepValidationProvider', cepValidationProvider);

    recipientService = container.resolve(RecipientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRecipient', () => {
    const recipientData: CreateRecipientDto = {
      email: 'test@example.com',
      cpf: '123.456.789-00',
      zipCode: '16204-135',
      firstName: 'João',
      lastName: 'Silva',
    };

    it('should create a recipient successfully', async () => {
      const recipientDto = {
        id: '1',
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: '123 Main St',
        number: 100,
        cpf: '000.000.000-00',
        complement: 'Apt 101',
        neighborhood: 'Central',
        city: 'TestCity',
        state: 'TS',
        zipCode: '12345',
        latitude: 10,
        longitude: 20,
      };

      recipientMapper.toDto.mockReturnValue(recipientDto);

      const result = await recipientService.createRecipient(recipientData);

      expect(result).toEqual(expect.objectContaining(recipientDto));
    });

    it('should handle validation errors', async () => {
      recipientValidationService.validateCreateData.mockRejectedValue(
        new ApplicationError('Validation failed', 400, true),
      );

      await expect(
        recipientService.createRecipient(recipientData),
      ).rejects.toThrow(ApplicationError);

      expect(
        recipientValidationService.validateCreateData,
      ).toHaveBeenCalledWith(recipientData);
      expect(recipientRepository.create).not.toHaveBeenCalled();
    });

    it('should handle errors from unique validation', async () => {
      recipientValidationService.validateUniqueness.mockRejectedValue(
        new ApplicationError(
          'Validation failed: Email or CPF already exists',
          400,
          true,
        ),
      );

      await expect(
        recipientService.createRecipient(recipientData),
      ).rejects.toThrow(ApplicationError);

      expect(
        recipientValidationService.validateUniqueness,
      ).toHaveBeenCalledWith(recipientData);
      expect(recipientRepository.create).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors during address processing', async () => {
      recipientValidationService.validateAddressCompleteness.mockRejectedValue(
        new Error('Unexpected error processing address'),
      );

      await expect(
        recipientService.createRecipient(recipientData),
      ).rejects.toThrow('Unexpected error processing address');

      expect(recipientRepository.create).not.toHaveBeenCalled();
    });

    it('should use address info from external service when available', async () => {
      const recipientDto = {
        id: '1',
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: '123 Main St',
        number: 100,
        cpf: '000.000.000-00',
        complement: 'Apt 101',
        neighborhood: 'Central',
        city: 'TestCity',
        state: 'TS',
        zipCode: '12345',
        latitude: 10,
        longitude: 20,
      };

      cepValidationProvider.getAddressByZipCode.mockResolvedValue({
        logradouro: '123 Main St',
        bairro: 'Central',
        localidade: 'TestCity',
        uf: 'TS',
        latitude: 10,
        longitude: 20,
      });

      recipientMapper.toDto.mockReturnValue(recipientDto);

      const result = await recipientService.createRecipient(recipientData);

      expect(result).toEqual(expect.objectContaining(recipientDto));
    });

    it('should fallback to recipient data when external service provides null values', async () => {
      const recipientDataWithFallback: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-00',
        zipCode: '16204-135',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Original Street',
        neighborhood: 'Original Neighborhood',
        city: 'Original City',
        state: 'Original State',
        latitude: 15,
        longitude: 25,
      };

      cepValidationProvider.getAddressByZipCode.mockResolvedValue({
        logradouro: undefined,
        bairro: undefined,
        localidade: undefined,
        uf: undefined,
        latitude: undefined,
        longitude: undefined,
      });

      cepValidationProvider.getCoordinatesFromAddress.mockResolvedValue({
        latitude: undefined,
        longitude: undefined,
      });

      recipientMapper.toDto.mockReturnValue({
        id: '1',
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Original Street',
        number: 100,
        cpf: '123.456.789-00',
        complement: 'Apt 101',
        neighborhood: 'Original Neighborhood',
        city: 'Original City',
        state: 'Original State',
        zipCode: '16204-135',
        latitude: 15,
        longitude: 25,
      });

      const result = await recipientService.createRecipient(
        recipientDataWithFallback,
      );

      expect(result).toEqual(
        expect.objectContaining({
          street: 'Original Street',
          neighborhood: 'Original Neighborhood',
          city: 'Original City',
          state: 'Original State',
          latitude: 15,
          longitude: 25,
        }),
      );
    });
  });

  describe('updateRecipient', () => {
    const recipientId = '123';

    const recipientData: CreateRecipientDto = {
      email: 'test@example.com',
      cpf: '123.456.789-00',
      zipCode: '16204-135',
      firstName: 'João',
      lastName: 'Silva',
    };

    it('should update address information when updating a recipient', async () => {
      const recipientUpdateData = {
        id: '123',
        email: 'update@example.com',
        firstName: 'Maria',
        lastName: 'Silva',
        street: 'Updated Street',
        city: 'Updated City',
        state: 'Updated State',
        zipCode: 'Updated Zip',
        latitude: 20,
        longitude: 30,
        number: 100,
        cpf: '000.000.000-00',
        neighborhood: 'Updated Neighborhood',
      };

      recipientRepository.findById.mockResolvedValue(new Recipient());
      recipientMapper.toDto.mockReturnValue(recipientUpdateData);

      const result = await recipientService.updateRecipient(
        '123',
        recipientUpdateData,
      );

      expect(result).toEqual(expect.objectContaining(recipientUpdateData));
    });

    it('should successfully update a recipient', async () => {
      recipientRepository.findById.mockResolvedValue(new Recipient());
      const updatedRecipient = new Recipient();
      Object.assign(updatedRecipient, {
        id: recipientId,
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        street: '456 Another St',
        number: 200,
        cpf: '111.222.333-44',
        complement: 'Apt 202',
        neighborhood: 'New Central',
        city: 'NewCity',
        state: 'NS',
        zipCode: '54321',
        latitude: 15,
        longitude: 25,
      });
      recipientRepository.update.mockResolvedValue(updatedRecipient);

      const result = await recipientService.updateRecipient(
        recipientId,
        updatedRecipient,
      );

      expect(
        recipientValidationService.validateUpdateData,
      ).toHaveBeenCalledWith(updatedRecipient, recipientId);
      expect(recipientRepository.update).toHaveBeenCalledWith(
        recipientId,
        expect.anything(),
      );
      expect(recipientMapper.toDto).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          firstName: 'João',
          lastName: 'Silva',
          street: '123 Main St',
          number: 100,
          cpf: '000.000.000-00',
          complement: 'Apt 101',
          neighborhood: 'Central',
          city: 'TestCity',
          state: 'TS',
          zipCode: '12345',
          email: 'test@example.com',
          latitude: 10,
          longitude: 20,
        }),
      );
    });

    it('should throw an error if recipient is not found', async () => {
      recipientRepository.findById.mockResolvedValue(undefined);

      await expect(
        recipientService.updateRecipient(recipientId, recipientData),
      ).rejects.toThrow(new ApplicationError('Recipient not found', 404, true));

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(recipientRepository.update).not.toHaveBeenCalled();
    });

    it('should check for uniqueness of email and cpf during update', async () => {
      recipientRepository.findById.mockResolvedValue(new Recipient());
      recipientValidationService.validateUniqueness.mockResolvedValue(
        undefined,
      );

      await recipientService.updateRecipient(recipientId, recipientData);

      expect(
        recipientValidationService.validateUniqueness,
      ).toHaveBeenCalledWith(recipientData, recipientId);
      expect(recipientRepository.update).toHaveBeenCalled();
    });

    it('should handle unexpected errors during the update process', async () => {
      recipientRepository.findById.mockResolvedValue(new Recipient());
      recipientRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        recipientService.updateRecipient(recipientId, recipientData),
      ).rejects.toThrow('Database error');

      expect(recipientRepository.update).toHaveBeenCalledWith(
        recipientId,
        expect.anything(),
      );
    });
  });

  describe('deleteRecipient', () => {
    it('should delete a recipient successfully', async () => {
      const recipientId = '123';
      const existingRecipient = new Recipient();

      recipientRepository.findById.mockResolvedValue(existingRecipient);
      recipientRepository.remove.mockResolvedValue(undefined);

      await recipientService.deleteRecipient(recipientId);

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(recipientRepository.remove).toHaveBeenCalledWith(
        existingRecipient,
      );
    });

    it('should throw an error if recipient not found', async () => {
      const recipientId = '123';

      recipientRepository.findById.mockResolvedValue(undefined);

      await expect(
        recipientService.deleteRecipient(recipientId),
      ).rejects.toThrow(new ApplicationError('Recipient not found', 404, true));

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(recipientRepository.remove).not.toHaveBeenCalled();
    });

    it('should handle errors when deleting a recipient', async () => {
      const recipientId = '123';
      const existingRecipient = new Recipient();

      recipientRepository.findById.mockResolvedValue(existingRecipient);
      recipientRepository.remove.mockRejectedValue(new Error('Database error'));

      await expect(
        recipientService.deleteRecipient(recipientId),
      ).rejects.toThrow('Database error');

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(recipientRepository.remove).toHaveBeenCalledWith(
        existingRecipient,
      );
    });
  });

  describe('findRecipientById', () => {
    it('should return a recipient if found', async () => {
      const recipientId = '123';
      const existingRecipient = new Recipient();
      Object.assign(existingRecipient, {
        id: recipientId,
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Some street',
        number: 100,
        cpf: '123.456.789-10',
        neighborhood: 'Some neighborhood',
        city: 'Some city',
        state: 'Some state',
        zipCode: '12345-678',
        latitude: 0,
        longitude: 0,
      });

      recipientRepository.findById.mockResolvedValue(existingRecipient);
      recipientMapper.toDto.mockReturnValue({
        id: recipientId,
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Some street',
        number: 100,
        cpf: '123.456.789-10',
        neighborhood: 'Some neighborhood',
        city: 'Some city',
        state: 'Some state',
        zipCode: '12345-678',
        latitude: 0,
        longitude: 0,
      });

      const result = await recipientService.findRecipientById(recipientId);

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(recipientMapper.toDto).toHaveBeenCalledWith(existingRecipient);
      expect(result).toEqual({
        id: recipientId,
        email: 'test@example.com',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Some street',
        number: 100,
        cpf: '123.456.789-10',
        neighborhood: 'Some neighborhood',
        city: 'Some city',
        state: 'Some state',
        zipCode: '12345-678',
        latitude: 0,
        longitude: 0,
      });
    });

    it('should return undefined if no recipient is found', async () => {
      const recipientId = '123';

      recipientRepository.findById.mockResolvedValue(undefined);

      const result = await recipientService.findRecipientById(recipientId);

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
      expect(result).toBeUndefined();
    });

    it('should handle errors during the search', async () => {
      const recipientId = '123';
      const errorMessage = 'Database error';

      recipientRepository.findById.mockRejectedValue(new Error(errorMessage));

      await expect(
        recipientService.findRecipientById(recipientId),
      ).rejects.toThrow(errorMessage);

      expect(recipientRepository.findById).toHaveBeenCalledWith(recipientId);
    });
  });

  describe('listRecipients', () => {
    it('should return a list of recipients', async () => {
      const recipient1 = new Recipient();
      recipient1.id = '1';
      recipient1.email = 'test1@example.com';
      recipient1.firstName = 'João';
      recipient1.lastName = 'Silva';

      const recipient2 = new Recipient();
      recipient2.id = '2';
      recipient2.email = 'test2@example.com';
      recipient2.firstName = 'Maria';
      recipient2.lastName = 'Silva';

      const recipients = [recipient1, recipient2];

      recipientRepository.find.mockResolvedValue(recipients);
      const result = await recipientService.listRecipients();

      expect(recipientRepository.find).toHaveBeenCalled();
      expect(recipientMapper.toDto).toHaveBeenCalledTimes(recipients.length);
      expect(result).toEqual(recipients.map(recipientMapper.toDto));
    });

    it('should return an empty list if no recipients are found', async () => {
      recipientRepository.find.mockResolvedValue([]);

      const result = await recipientService.listRecipients();

      expect(recipientRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors during fetching recipients', async () => {
      const errorMessage = 'Database error';
      recipientRepository.find.mockRejectedValue(new Error(errorMessage));

      await expect(recipientService.listRecipients()).rejects.toThrow(
        errorMessage,
      );

      expect(recipientRepository.find).toHaveBeenCalled();
    });
  });

  describe('processAddressInfo', () => {
    it('should process address information and return updated recipient data', async () => {
      const recipientData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-00',
        zipCode: '16204-135',
        firstName: 'João',
        lastName: 'Silva',
      };

      cepValidationProvider.getAddressByZipCode.mockResolvedValue({
        logradouro: 'Test Street',
        bairro: 'Test Neighborhood',
        localidade: 'Test City',
        uf: 'TS',
        latitude: 10,
        longitude: 20,
      });

      cepValidationProvider.getCoordinatesFromAddress.mockResolvedValue({
        latitude: 10,
        longitude: 20,
      });

      const result =
        await recipientService['processAddressInfo'](recipientData);

      expect(result).toEqual(
        expect.objectContaining({
          ...recipientData,
          street: 'Test Street',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          latitude: 10,
          longitude: 20,
        }),
      );
    });

    it('should fallback to recipient data when external service provides null values', async () => {
      const recipientData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-00',
        zipCode: '16204-135',
        firstName: 'João',
        lastName: 'Silva',
        street: 'Original Street',
        neighborhood: 'Original Neighborhood',
        city: 'Original City',
        state: 'Original State',
        latitude: 15,
        longitude: 25,
      };

      cepValidationProvider.getAddressByZipCode.mockResolvedValue({
        logradouro: undefined,
        bairro: undefined,
        localidade: undefined,
        uf: undefined,
        latitude: undefined,
        longitude: undefined,
      });

      cepValidationProvider.getCoordinatesFromAddress.mockResolvedValue({
        latitude: undefined,
        longitude: undefined,
      });

      const result =
        await recipientService['processAddressInfo'](recipientData);

      expect(result).toEqual(
        expect.objectContaining({
          ...recipientData,
          street: 'Original Street',
          neighborhood: 'Original Neighborhood',
          city: 'Original City',
          state: 'Original State',
          latitude: 15,
          longitude: 25,
        }),
      );
    });

    it('should handle unexpected errors during address processing', async () => {
      const recipientData: CreateRecipientDto = {
        email: 'test@example.com',
        cpf: '123.456.789-00',
        zipCode: '16204-135',
        firstName: 'João',
        lastName: 'Silva',
      };

      cepValidationProvider.getAddressByZipCode.mockRejectedValue(
        new Error('Unexpected error processing address'),
      );

      await expect(
        recipientService['processAddressInfo'](recipientData),
      ).rejects.toThrow('Unexpected error processing address');
    });
  });
});
