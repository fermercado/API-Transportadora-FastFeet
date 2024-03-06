import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserWithoutPassword } from '../../domain/entities/User';
import bcrypt from 'bcrypt';
import UserValidationService from '../validation/UserValidationService';
import { CreateUserDto } from '../dtos/user/CreateUserDto';
import { UpdateUserDto } from '../dtos/user/UpdateUserDto';

@injectable()
export class UserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject(UserValidationService)
    private userValidationService: UserValidationService,
  ) {}

  public async createUser(
    userData: CreateUserDto,
  ): Promise<UserWithoutPassword> {
    await this.userValidationService.validateCreationData(userData);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userToSave: Partial<User> = {
      ...userData,
      password: hashedPassword,
    };
    const savedUser = await this.userRepository.create(userToSave);
    return this.omitPassword(savedUser);
  }

  public async updateUser(
    id: string,
    userData: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    await this.userValidationService.validateUpdateData(id, userData);
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const { confirmPassword, ...updateData } = userData;
    const updatedUser = await this.userRepository.update(id, updateData);
    return this.omitPassword(updatedUser);
  }

  public async deleteUser(id: string): Promise<void> {
    await this.userRepository.remove(id);
  }

  public async findUserById(
    id: string,
  ): Promise<UserWithoutPassword | undefined> {
    const user = await this.userRepository.findById(id);
    if (!user) return undefined;
    return this.omitPassword(user);
  }

  public async listUsers(): Promise<UserWithoutPassword[]> {
    const users = await this.userRepository.findAll();
    return users.map(this.omitPassword);
  }

  public async validateUser(
    cpf: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findByCpf(cpf);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    return this.omitPassword(user);
  }

  private omitPassword(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
