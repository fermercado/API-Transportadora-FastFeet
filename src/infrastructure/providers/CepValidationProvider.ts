import axios from 'axios';
import 'dotenv/config';

export class CepValidationProvider {
  public async getAddressByZipCode(zipCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://viacep.com.br/ws/${zipCode}/json/`,
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to retrieve ZIP code information.');
    }
  }

  public async getCoordinatesFromAddress(
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
