import { v2 as cloudinary } from 'cloudinary';
import ImageUploadService from '../../../../infrastructure/service/ImageUploadService';
import CloudinaryConfig from '../../../../infrastructure/config/CloudinaryConfig';
import { UploadApiResponse } from 'cloudinary';

jest.mock('cloudinary');
jest.mock('../../../../infrastructure/config/CloudinaryConfig');

describe('ImageUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (CloudinaryConfig.configure as jest.Mock).mockImplementation(() => {});

    (
      cloudinary.uploader.upload as jest.MockedFunction<
        typeof cloudinary.uploader.upload
      >
    ).mockReset();
  });

  it('should upload an image and return the secure URL', async () => {
    const mockFilePath = 'path/to/image.jpg';
    const mockSecureUrl = 'https://example.com/secure-image.jpg';

    (
      cloudinary.uploader.upload as jest.MockedFunction<
        typeof cloudinary.uploader.upload
      >
    ).mockResolvedValue({
      secure_url: mockSecureUrl,
    } as UploadApiResponse);

    const result = await ImageUploadService.uploadImage(mockFilePath);

    expect(result).toBe(mockSecureUrl);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(mockFilePath, {
      folder: 'fastfeet',
    });
  });

  it('should throw an error when image upload fails', async () => {
    const mockFilePath = 'path/to/image.jpg';
    const mockError = new Error('Upload failed');

    (
      cloudinary.uploader.upload as jest.MockedFunction<
        typeof cloudinary.uploader.upload
      >
    ).mockRejectedValue(mockError);

    await expect(ImageUploadService.uploadImage(mockFilePath)).rejects.toThrow(
      'Image upload service error.',
    );

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(mockFilePath, {
      folder: 'fastfeet',
    });
  });
});
