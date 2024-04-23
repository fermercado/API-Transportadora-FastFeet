import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsUUID } from 'class-validator';

@Entity('recipients')
export class Recipient {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  street!: string;

  @Column()
  number!: number;

  @Column({ nullable: true })
  complement?: string;

  @Column()
  neighborhood!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  zipCode!: string;

  @IsEmail()
  @Column()
  email!: string;

  @Column()
  cpf!: string;

  @Column({ type: 'float', nullable: true })
  latitude!: number;

  @Column({ type: 'float', nullable: true })
  longitude!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
