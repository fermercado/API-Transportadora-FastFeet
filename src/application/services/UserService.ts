import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserValidationService } from '../validation/UserValidationService';
import { User } from '../../domain/entities/User';
import { CreateUserDto } from '../dtos/user/CreateUserDto';
import { UpdateUserDto } from '../dtos/user/UpdateUserDto';
import { ResponseUserDto } from '../dtos/user/ResponseUserDto';
import { UserMapper } from '../../application/mappers/UserMappers';
import bcrypt from 'bcrypt';
import { UserFilter } from '../../domain/interface/UserFilter';
import { UserRole } from '../../domain/enums/UserRole';
import { PasswordHasher } from '../../application/utils/PasswordHasher';

@injectable()
export class UserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('UserValidationService')
    private userValidationService: UserValidationService,
    @inject('UserMapper') private userMapper: UserMapper,
    @inject('PasswordHasher') private passwordHasher: PasswordHasher,
  ) {}

  public async createUser(userData: CreateUserDto): Promise<ResponseUserDto> {
    await this.userValidationService.validateCreateData(userData);
    userData.password = await this.passwordHasher.hash(userData.password);
    const userToSave: Partial<User> = { ...userData };
    const savedUser = await this.userRepository.create(userToSave);
    return this.userMapper.toResponseUserDto(savedUser);
  }

  public async updateUser(
    id: string,
    userData: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    await this.userValidationService.validateUserExistence(id);

    await this.userValidationService.validateUpdateData(id, userData);

    if (userData.password) {
      userData.password = await this.passwordHasher.hash(userData.password);
    }

    const updatedUser = await this.userRepository.update(id, userData);

    return this.userMapper.toResponseUserDto(updatedUser);
  }

  public async deleteUser(id: string, loggedInUserId: string): Promise<void> {
    await this.userValidationService.validateUserExistence(id);
    await this.userValidationService.validateDeleteSelfOperation(
      id,
      loggedInUserId,
    );
    await this.userRepository.remove(id);
  }

  public async findUserById(id: string): Promise<ResponseUserDto | undefined> {
    await this.userValidationService.validateUserExistence(id);
    const user = await this.userRepository.findById(id);
    if (!user) return undefined;
    return this.userMapper.toResponseUserDto(user);
  }

  public async listUsers(role?: string): Promise<ResponseUserDto[]> {
    let users: User[];
    if (role) {
      const validRole = Object.values(UserRole).includes(role as UserRole)
        ? (role as UserRole)
        : undefined;

      const filter: UserFilter = { role: validRole };
      users = await this.userRepository.findByFilter(filter);
    } else {
      users = await this.userRepository.findAll();
    }
    return users.map(this.userMapper.toResponseUserDto);
  }

  public async validateUser(
    cpf: string,
    password: string,
  ): Promise<ResponseUserDto | null> {
    const user = await this.userRepository.findByCpf(cpf);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    return this.userMapper.toResponseUserDto(user);
  }
}
