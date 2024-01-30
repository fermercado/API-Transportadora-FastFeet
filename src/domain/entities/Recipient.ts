import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  street!: string;

  @Column()
  number!: number;

  @Column({ nullable: true })
  complement?: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  zipCode!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
