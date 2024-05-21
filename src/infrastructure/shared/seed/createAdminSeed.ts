import 'reflect-metadata';
import { hash } from 'bcrypt';
import AppDataSource from '../../orm/ormconfig';
import { User } from '../../../domain/entities/User';
import { UserValidator } from '../../../domain/validators/UserValidator';
import { UserRole } from '../../../domain/enums/UserRole';
import { DeepPartial } from 'typeorm';

class CreateAdminSeed {
  private static async createAdmin() {
    await AppDataSource.initialize();

    try {
      const userRepository = AppDataSource.getRepository(User);

      const adminData = {
        firstName: '',
        lastName: '',
        cpf: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: UserRole.Admin,
        isDefaultAdmin: true,
        deleteKey: '',
      };

      const validatedData = UserValidator.validateCreateUser.parse(adminData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...dataToSave } = validatedData;

      console.log('Data to save:', dataToSave);

      const adminExists = await userRepository.findOneBy({
        cpf: dataToSave.cpf,
        email: dataToSave.email,
      });
      if (adminExists) {
        console.log('An admin user already exists.');
        return;
      }

      dataToSave.password = await hash(dataToSave.password, 8);

      const admin = userRepository.create(dataToSave as DeepPartial<User>);
      await userRepository.save(admin);
      console.log('Admin user created successfully');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating the admin user:', error.message);
      } else {
        console.error('Unknown error during admin user creation');
      }
    } finally {
      await AppDataSource.destroy();
    }
  }

  public static run() {
    this.createAdmin();
  }
}

CreateAdminSeed.run();
