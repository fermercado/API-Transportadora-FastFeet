import { CepValidationProvider } from '../../infrastructure/providers/CepValidationProvider';
import { ExternalValidator } from '../../domain/validators/ExternalValidator';

export class AddressService {
  private cepValidationProvider: CepValidationProvider;

  constructor(cepValidationProvider: CepValidationProvider) {
    this.cepValidationProvider = cepValidationProvider;
  }

  public async getAddressByZipCode(zipCode: string): Promise<any> {
    try {
      const addressData =
        await this.cepValidationProvider.getAddressByZipCode(zipCode);
      ExternalValidator.validateCEPResponse(addressData);

      const coordinates =
        await this.cepValidationProvider.getCoordinatesFromAddress(
          `${addressData.logradouro}, ${addressData.localidade}, ${addressData.uf}`,
        );

      return { ...addressData, ...coordinates };
    } catch (error) {
      throw new Error('Failed to retrieve ZIP code information.');
    }
  }
}
