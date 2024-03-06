import { injectable, inject } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

@injectable()
export class UserRepository implements IUserRepository {
  private ormRepository: Repository<User>;

  constructor(@inject('DataSource') private dataSource: DataSource) {
    this.ormRepository = this.dataSource.getRepository(User);
  }

  public async create(userData: Partial<User>): Promise<User> {
    const user = this.ormRepository.create(userData);
    return this.ormRepository.save(user);
  }

  public async update(id: string, userData: Partial<User>): Promise<User> {
    let user = await this.ormRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, userData);
    return this.ormRepository.save(user);
  }

  public async find(): Promise<User[]> {
    return this.ormRepository.find();
  }

  public async findById(id: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOneBy({ id });
    return user ?? undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  public async findAll(): Promise<User[]> {
    return this.ormRepository.find();
  }

  public async findByCpf(cpf: string): Promise<User | undefined> {
    const user = await this.ormRepository.findOneBy({ cpf });
    return user ?? undefined;
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  public async remove(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
