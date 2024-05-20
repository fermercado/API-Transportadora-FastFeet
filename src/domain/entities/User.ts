import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/UserRole';
import { IsEmail, IsEnum, IsUUID } from 'class-validator';

@Entity('users')
export class User {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  cpf!: string;

  @Column()
  password!: string;

  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Deliveryman,
  })
  role!: UserRole;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @IsEmail()
  @Column({ nullable: true, unique: true })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
