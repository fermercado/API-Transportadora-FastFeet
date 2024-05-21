import bcrypt from 'bcrypt';
import { PasswordHasher } from '../../../../infrastructure/shared/utils/PasswordHasher';

jest.mock('bcrypt');

describe('PasswordHasher', () => {
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new PasswordHasher();
  });

  describe('hash', () => {
    it('should hash the password correctly', async () => {
      const password = 'mySecurePassword';
      const hashedPassword = 'hashedPassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordHasher.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should throw an error if bcrypt.hash fails', async () => {
      const password = 'mySecurePassword';

      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('hashing error'));

      await expect(passwordHasher.hash(password)).rejects.toThrow(
        'hashing error',
      );
    });
  });
});
