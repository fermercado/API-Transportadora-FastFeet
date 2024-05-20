import { User } from '../../../../domain/entities/User';
import { ResponseUserDto } from '../../../../application/dtos/user/ResponseUserDto';
import { UserMapper } from '../../../../application/mappers/UserMappers';
import { UserRole } from '../../../../domain/enums/UserRole';

describe('UserMapper', () => {
  let userMapper: UserMapper;

  beforeEach(() => {
    userMapper = new UserMapper();
  });

  it('should map User to ResponseUserDto correctly', () => {
    const user = new User();
    user.id = '1';
    user.firstName = 'João';
    user.lastName = 'Silva';
    user.cpf = '123.456.789-00';
    user.email = 'joao.silva@example.com';
    user.role = UserRole.Admin;

    const responseUserDto: ResponseUserDto = userMapper.toResponseUserDto(user);

    expect(responseUserDto).toEqual({
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      cpf: '123.456.789-00',
      email: 'joao.silva@example.com',
      role: UserRole.Admin,
    });
  });
});
