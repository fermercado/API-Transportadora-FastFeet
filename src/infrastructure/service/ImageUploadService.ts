import { v2 as cloudinary } from 'cloudinary';
import CloudinaryConfig from '../config/CloudinaryConfig';

class ImageUploadService {
  constructor() {
    CloudinaryConfig.configure();
  }

  async uploadImage(filePath: string, options = {}): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        ...options,
        folder: 'fastfeet',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Image upload service error.');
    }
  }
}

export default new ImageUploadService();
