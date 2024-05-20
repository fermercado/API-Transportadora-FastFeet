import { RecipientValidator } from '../../../../domain/validators/RecipientValidator';
import { z } from 'zod';

describe('RecipientValidator', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('createSchema', () => {
    it('should fail validation for an invalid CPF format', async () => {
      const invalidRecipient = {
        firstName: 'Maria',
        lastName: 'Silva',
        cpf: '12345678909',
        email: 'maria.silva@example.com',
        zipCode: '12345-678',
        number: 123,
        complement: 'Apt 4B',
      };

      await expect(
        RecipientValidator.createSchema.parseAsync(invalidRecipient),
      ).rejects.toThrow(z.ZodError);
    });

    it('should fail validation for an invalid email format', async () => {
      const invalidRecipient = {
        firstName: 'Maria',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'maria.silva@com',
        zipCode: '12345-678',
        number: 123,
        complement: 'Apt 4B',
      };

      await expect(
        RecipientValidator.createSchema.parseAsync(invalidRecipient),
      ).rejects.toThrow(z.ZodError);
    });

    it('should fail validation for a negative number', async () => {
      const invalidRecipient = {
        firstName: 'Maria',
        lastName: 'Silva',
        cpf: '123.456.789-09',
        email: 'maria.silva@example.com',
        zipCode: '12345-678',
        number: -123,
        complement: 'Apt 4B',
      };

      await expect(
        RecipientValidator.createSchema.parseAsync(invalidRecipient),
      ).rejects.toThrow(z.ZodError);
    });
  });

  describe('updateSchema', () => {
    it('should pass validation for a valid recipient update', async () => {
      const validRecipientUpdate = {
        firstName: 'Maria',
        email: 'maria.silva@example.com',
      };

      await expect(
        RecipientValidator.updateSchema.parseAsync(validRecipientUpdate),
      ).resolves.not.toThrow();
    });

    it('should fail validation for an invalid CPF format in update', async () => {
      const invalidRecipientUpdate = {
        cpf: '12345678909',
      };

      await expect(
        RecipientValidator.updateSchema.parseAsync(invalidRecipientUpdate),
      ).rejects.toThrow(z.ZodError);
    });

    it('should fail validation for an invalid email format in update', async () => {
      const invalidRecipientUpdate = {
        email: 'maria.silva@com',
      };

      await expect(
        RecipientValidator.updateSchema.parseAsync(invalidRecipientUpdate),
      ).rejects.toThrow(z.ZodError);
    });

    it('should fail validation for a negative number in update', async () => {
      const invalidRecipientUpdate = {
        number: -123,
      };

      await expect(
        RecipientValidator.updateSchema.parseAsync(invalidRecipientUpdate),
      ).rejects.toThrow(z.ZodError);
    });

    it('should pass validation if number is omitted in update', async () => {
      const validRecipientUpdate = {
        firstName: 'Maria',
        email: 'maria.silva@example.com',
      };

      await expect(
        RecipientValidator.updateSchema.parseAsync(validRecipientUpdate),
      ).resolves.not.toThrow();
    });
  });
});
