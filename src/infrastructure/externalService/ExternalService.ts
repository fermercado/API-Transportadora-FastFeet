import axios from 'axios';
import { ExternalValidator } from './ExternalValidator';
import 'dotenv/config';

export class ExternalServices {
  public static async getAddressByZipCode(zipCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${zipCode}/json/`,
      );

      ExternalValidator.validateCEPResponse(response.data);

      const coordinates = await this.getCoordinatesFromAddress(
        `${response.data.logradouro}, ${response.data.localidade}, ${response.data.uf}`,
      );

      return { ...response.data, ...coordinates };
    } catch (error) {
      throw new Error('Failed to retrieve ZIP code information.');
    }
  }

  private static async getCoordinatesFromAddress(
    address: string,
  ): Promise<{ latitude?: number; longitude?: number }> {
    try {
      const response = await axios.get(
        'https://api.opencagedata.com/geocode/v1/json',
        {
          params: {
            q: address,
            key: process.env.OPENCAGE_API_KEY,
            language: 'pt',
            countrycode: 'br',
          },
        },
      );

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error(
          'Failed to retrieve coordinates for the given address.',
        );
      }
    } catch (error) {
      throw new Error('Failed to retrieve coordinates for the given address.');
    }
  }
}
