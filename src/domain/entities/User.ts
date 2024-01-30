import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  cpf!: string;

  @Column()
  password!: string;

  @Column()
  type!: 'admin' | 'deliveryman';

  @Column()
  name!: string;

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;
