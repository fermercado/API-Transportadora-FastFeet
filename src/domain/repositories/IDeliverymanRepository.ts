import { Deliveryman } from '../entities/Deliveryman';

export interface IDeliverymanRepository {
  create(deliverymanData: Partial<Deliveryman>): Promise<Deliveryman>;
  save(deliveryman: Deliveryman): Promise<Deliveryman>;
  remove(deliveryman: Deliveryman): Promise<void>;
  findById(id: string): Promise<Deliveryman | undefined>;
  find(): Promise<Deliveryman[]>;
}
