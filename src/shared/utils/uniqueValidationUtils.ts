import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { injectable, inject } from 'tsyringe';
import { ApplicationError } from '../errors/ApplicationError';
import { ErrorDetail } from '../../@types/error-types';
import { User } from '../../domain/entities/User';
import { Recipient } from '../../domain/entities/Recipient';

@injectable()
export class UniqueValidationUtils {
  constructor(
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
  ) {}

  async checkUniqueEmail(
    email: string,
    repositoryType: 'user' | 'recipient',
    excludeId?: string,
  ): Promise<void> {
    await this.checkUniqueness(email, 'email', repositoryType, excludeId);
  }

  async checkUniqueCpf(
    cpf: string,
    repositoryType: 'user' | 'recipient',
    excludeId?: string,
  ): Promise<void> {
    await this.checkUniqueness(cpf, 'cpf', repositoryType, excludeId);
  }

  private async checkUniqueness(
    value: string,
    fieldName: string,
    repositoryType: 'user' | 'recipient',
    excludeId?: string,
  ): Promise<void> {
    const findBy = this.getFindByMethod(fieldName, repositoryType);
    let entity = await findBy(value);

    if (entity && entity.id !== excludeId) {
      const errorDetails: ErrorDetail[] = [
        {
          key: fieldName,
          value: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already in use`,
        },
      ];
      throw new ApplicationError(
        `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already in use`,
        400,
        true,
        errorDetails,
      );
    }
  }

  private getFindByMethod(
    fieldName: string,
    repositoryType: 'user' | 'recipient',
  ): (value: string) => Promise<User | Recipient | undefined> {
    if (repositoryType === 'recipient') {
      return fieldName === 'email'
        ? this.recipientRepository.findByEmail.bind(this.recipientRepository)
        : this.recipientRepository.findByCpf.bind(this.recipientRepository);
    } else {
      return fieldName === 'email'
        ? this.userRepository.findByEmail.bind(this.userRepository)
        : this.userRepository.findByCpf.bind(this.userRepository);
    }
  }
}
