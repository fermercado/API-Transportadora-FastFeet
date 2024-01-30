import { injectable, inject } from 'tsyringe';
import { IDeliverymanRepository } from '../../domain/repositories/IDeliverymanRepository';
import { Deliveryman } from '../../domain/entities/Deliveryman';

@injectable()
export class DeliverymanService {
  constructor(
    @inject('IDeliverymanRepository')
    private deliverymanRepository: IDeliverymanRepository,
  ) {}

  public async createDeliveryman(
    deliverymanData: Partial<Deliveryman>,
  ): Promise<Deliveryman> {
    const newDeliveryman = this.deliverymanRepository.create(deliverymanData);
    return this.deliverymanRepository.save(await newDeliveryman);
  }

  public async updateDeliveryman(
    id: string,
    deliverymanData: Partial<Deliveryman>,
  ): Promise<Deliveryman> {
    const deliveryman = await this.deliverymanRepository.findById(id);
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }
    Object.assign(deliveryman, deliverymanData);
    return this.deliverymanRepository.save(deliveryman);
  }

  public async deleteDeliveryman(id: string): Promise<void> {
    const deliveryman = await this.deliverymanRepository.findById(id);
    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }
    await this.deliverymanRepository.remove(deliveryman);
  }

  public async findDeliverymanById(
    id: string,
  ): Promise<Deliveryman | undefined> {
    return this.deliverymanRepository.findById(id);
  }

  public async listDeliverymen(): Promise<Deliveryman[]> {
    return this.deliverymanRepository.find();
  }
}
