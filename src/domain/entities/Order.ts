import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Deliveryman } from './Deliveryman';
import { Recipient } from './Recipient';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  trackingCode!: string;

  @Column({
    type: 'enum',
    enum: ['waiting', 'picked_up', 'delivered', 'returned'],
    default: 'waiting',
  })
  status!: 'waiting' | 'picked_up' | 'delivered' | 'returned';

  @Column({ nullable: true })
  pickUpDate?: Date;

  @Column({ nullable: true })
  deliveryDate?: Date;

  @Column({ nullable: true })
  deliveryPhoto?: string;

  @ManyToOne(() => Deliveryman)
  @JoinColumn({ name: 'deliveryman_id' })
  deliveryman!: Deliveryman;

  @ManyToOne(() => Recipient)
  @JoinColumn({ name: 'recipient_id' })
  recipient!: Recipient;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
