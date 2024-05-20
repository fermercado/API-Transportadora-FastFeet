import bcrypt from 'bcrypt';

export class PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
