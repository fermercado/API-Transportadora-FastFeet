import bcrypt from 'bcryptjs';

export class PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
