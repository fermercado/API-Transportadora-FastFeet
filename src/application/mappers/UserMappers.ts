import { User } from '../../domain/entities/User';
import { ResponseUserDto } from '../dtos/user/ResponseUserDto';
import { injectable } from 'tsyringe';

@injectable()
export class UserMapper {
  public toResponseUserDto(user: User): ResponseUserDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      cpf: user.cpf,
      email: user.email,
      role: user.role,
    };
  }
}
