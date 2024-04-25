import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Recipient } from './Recipient';
import { OrderStatus } from '../enums/OrderStatus';
import { IsUUID } from 'class-validator';

@Entity('orders')
export class Order {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  trackingCode!: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  deliveryman?: User;

  @ManyToOne(() => Recipient, (recipient) => recipient.id)
  recipient!: Recipient;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.Pending,
  })
  status!: OrderStatus;

  @Column({ nullable: true })
  deliveryPhoto?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
