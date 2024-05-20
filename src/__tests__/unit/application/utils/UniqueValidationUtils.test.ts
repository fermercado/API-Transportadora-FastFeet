import 'reflect-metadata';
import { UniqueValidationUtils } from '../../../../application/utils/uniqueValidationUtils';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { IRecipientRepository } from '../../../../domain/repositories/IRecipientRepository';
import { ApplicationError } from '../../../../infrastructure/shared/errors/ApplicationError';
import { User } from '../../../../domain/entities/User';
import { Recipient } from '../../../../domain/entities/Recipient';

describe('UniqueValidationUtils', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let recipientRepository: jest.Mocked<IRecipientRepository>;
  let uniqueValidationUtils: UniqueValidationUtils;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    recipientRepository = {
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
    } as unknown as jest.Mocked<IRecipientRepository>;

    uniqueValidationUtils = new UniqueValidationUtils(
      userRepository,
      recipientRepository,
    );
  });

  describe('checkUniqueEmail', () => {
    it('should not throw if email is unique for user', async () => {
      userRepository.findByEmail.mockResolvedValue(undefined);

      await expect(
        uniqueValidationUtils.checkUniqueEmail('unique@example.com', 'user'),
      ).resolves.not.toThrow();
    });

    it('should throw if email is not unique for user', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: '1' } as User);

      await expect(
        uniqueValidationUtils.checkUniqueEmail('notunique@example.com', 'user'),
      ).rejects.toThrow(ApplicationError);
    });

    it('should not throw if email is unique for recipient', async () => {
      recipientRepository.findByEmail.mockResolvedValue(undefined);

      await expect(
        uniqueValidationUtils.checkUniqueEmail(
          'unique@example.com',
          'recipient',
        ),
      ).resolves.not.toThrow();
    });

    it('should throw if email is not unique for recipient', async () => {
      recipientRepository.findByEmail.mockResolvedValue({
        id: '1',
      } as Recipient);

      await expect(
        uniqueValidationUtils.checkUniqueEmail(
          'notunique@example.com',
          'recipient',
        ),
      ).rejects.toThrow(ApplicationError);
    });
  });

  describe('checkUniqueCpf', () => {
    it('should not throw if cpf is unique for user', async () => {
      userRepository.findByCpf.mockResolvedValue(undefined);

      await expect(
        uniqueValidationUtils.checkUniqueCpf('123.456.789-00', 'user'),
      ).resolves.not.toThrow();
    });

    it('should throw if cpf is not unique for user', async () => {
      userRepository.findByCpf.mockResolvedValue({ id: '1' } as User);

      await expect(
        uniqueValidationUtils.checkUniqueCpf('123.456.789-00', 'user'),
      ).rejects.toThrow(ApplicationError);
    });

    it('should not throw if cpf is unique for recipient', async () => {
      recipientRepository.findByCpf.mockResolvedValue(undefined);

      await expect(
        uniqueValidationUtils.checkUniqueCpf('123.456.789-00', 'recipient'),
      ).resolves.not.toThrow();
    });

    it('should throw if cpf is not unique for recipient', async () => {
      recipientRepository.findByCpf.mockResolvedValue({ id: '1' } as Recipient);

      await expect(
        uniqueValidationUtils.checkUniqueCpf('123.456.789-00', 'recipient'),
      ).rejects.toThrow(ApplicationError);
    });
  });
});
