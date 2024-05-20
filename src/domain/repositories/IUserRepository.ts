import { User } from '../entities/User';
import { UserFilter } from '../../domain/interface/UserFilter';

export interface IUserRepository {
  create(userData: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | undefined>;
  findByCpf(cpf: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByFilter(filter: UserFilter): Promise<User[]>;
  update(id: string, userData: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  remove(id: string): Promise<void>;
}
