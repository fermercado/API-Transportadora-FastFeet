import { User } from '../entities/User';

export interface IUserRepository {
  create(userData: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | undefined>;
  find(): Promise<User[]>;
  findByCpf(cpf: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
  remove(user: User): Promise<void>;
}
