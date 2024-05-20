import axios from 'axios';
import { ExternalValidator } from './ExternalValidator';
import 'dotenv/config';

export class ExternalServices {
  public static async getAddressByZipCode(zipCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${zipCode}/json/`,
      );
      console.log(
        `Response from viacep.com.br: ${JSON.stringify(response.data)}`,
      );

      ExternalValidator.validateCEPResponse(response.data);

      const coordinates = await this.getCoordinatesFromAddress(
        `${response.data.logradouro}, ${response.data.localidade}, ${response.data.uf}`,
      );

      return { ...response.data, ...coordinates };
    } catch (error) {
      console.error('Error searching for ZIP code', error);
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
        console.warn('No results found for address:', address);
        throw new Error(
          'Failed to retrieve coordinates for the given address.',
        );
      }
    } catch (error) {
      console.error('Error obtaining coordinates from address', error);
      throw new Error('Failed to retrieve coordinates for the given address.');
    }
  }
}
