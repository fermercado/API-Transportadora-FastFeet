import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRecipientRepository } from '../../domain/repositories/IRecipientRepository';
import { injectable, inject } from 'tsyringe';
import { ApplicationError } from '../errors/ApplicationError';

@injectable()
class UniqueValidationUtils {
  constructor(
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('IRecipientRepository')
    private recipientRepository: IRecipientRepository,
  ) {}

  async checkUniqueRecipientEmail(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const recipientByEmail = await this.recipientRepository.findByEmail(email);
    if (recipientByEmail && recipientByEmail.id !== excludeId) {
      throw new ApplicationError('Email already in use', 400);
    }
  }

  async checkUniqueRecipientCpf(
    cpf: string,
    excludeId?: string,
  ): Promise<void> {
    const recipientByCpf = await this.recipientRepository.findByCpf(cpf);
    if (recipientByCpf && recipientByCpf.id !== excludeId) {
      throw new ApplicationError('CPF already in use', 400);
    }
  }
}

export default UniqueValidationUtils;
