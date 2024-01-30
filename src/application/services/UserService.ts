import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { injectable, inject } from 'tsyringe';
import { User, UserWithoutPassword } from '../../domain/entities/User';
import bcrypt from 'bcrypt';

@injectable()
export class UserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  public async createUser(userData: Partial<User>): Promise<User> {
    if (!userData.password) {
      throw new Error('Password is required');
    }
    userData.password = await bcrypt.hash(userData.password, 10);
    const savedUser = await this.userRepository.save(userData as User);
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  public async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
    }

    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  public async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.remove(user);
  }

  public async findUserById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  public async listUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async changePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    return this.userRepository.save(user);
  }

  public async validateUser(
    cpf: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findByCpf(cpf);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
