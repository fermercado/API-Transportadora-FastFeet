import { v2 as cloudinary } from 'cloudinary';
import CloudinaryConfig from '../../../../infrastructure/config/CloudinaryConfig';

jest.mock('cloudinary');

describe('CloudinaryConfig', () => {
  it('should configure cloudinary with the correct settings from environment variables', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'my_cloud_name';
    process.env.CLOUDINARY_API_KEY = 'my_api_key';
    process.env.CLOUDINARY_API_SECRET = 'my_api_secret';

    const configSpy = jest.spyOn(cloudinary, 'config');

    CloudinaryConfig.configure();

    expect(configSpy).toHaveBeenCalledWith({
      cloud_name: 'my_cloud_name',
      api_key: 'my_api_key',
      api_secret: 'my_api_secret',
      secure: true,
    });
  });
});
