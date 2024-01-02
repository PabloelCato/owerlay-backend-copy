import { Storage } from '@google-cloud/storage';
import { Image } from '../entities/Image.js';
import { myDataSource } from '../datasource.js';
import { User } from '../entities/User.js';
import imageType from 'image-type';

interface UploadResult {
  imageUrl?: string;
  error?: { message: string };
}

interface ImageDataForUpload {
  image: string;
  uuid: string;
  format: string;
  location: string;
  description: string;
  tags: string[];
}

interface ImageDataForDatabase {
  userUuid: string;
  imageURL: string;
  uuid: string;
  location: string;
  description: string;
  tags: string[];
}

const credentials = {};


const storage = new Storage({ credentials });
const bucketName = 'images-storage-bucket';

const isValidFormat = (mime: string) => {
  const validFormats = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validFormats.includes(mime);
};

const isValidSize = (data: Buffer) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return data.length <= maxSize;
};

const validateImage = async (base64Data: string) => {
  const binaryData = Buffer.from(base64Data, 'base64');
  const imageInfo = await imageType(binaryData);

  if (!imageInfo || !isValidFormat(imageInfo.mime)) {
    return { message: 'Invalid image file format' };
  }

  if (!isValidSize(binaryData)) {
    return { message: 'Image file exceeds size limit' };
  }
};

const validateImageData = async (imageData: ImageDataForUpload) => {
  if (
    !imageData.image ||
    !imageData.uuid ||
    !imageData.location ||
    !imageData.description ||
    !imageData.tags
  ) {
    return {
      message: 'Image, UUID, location, description and tags are required.',
    };
  }

  if (
    typeof imageData.image !== 'string' ||
    typeof imageData.uuid !== 'string' ||
    typeof imageData.location !== 'string' ||
    typeof imageData.description !== 'string' ||
    !Array.isArray(imageData.tags)
  ) {
    return {
      message: 'Invalid data types provided.',
    };
  }

  const imageValidation = await validateImage(imageData.image);

  if (imageValidation) {
    return imageValidation;
  }
};

const uploadImageToStorage = async (
  image: string,
  uuid: string,
): Promise<UploadResult> => {
  const binaryData = Buffer.from(image, 'base64');
  const imageInfo = await imageType(binaryData);

  const mimeType = imageInfo?.mime;
  const parts = mimeType?.split('/') ?? [];
  const fileExtension = parts[1];

  const bucket = storage.bucket(bucketName);
  const fileName = `${uuid}.${fileExtension}`;
  const fileObj = bucket.file(fileName);

  const stream = fileObj.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
  });

  return new Promise<UploadResult>((resolve, reject) => {
    stream.on('error', error => {
      reject(error);
    });

    stream.on('finish', () => {
      const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve({ imageUrl });
    });

    stream.end(binaryData);
  });
};

const saveImageToDatabase = async (
  data: ImageDataForDatabase,
): Promise<void> => {
  try {
    const { userUuid, imageURL, uuid, location, description, tags } = data;

    let user = await myDataSource
      .getRepository(User)
      .findOne({ where: { userUuid } });

    if (!user) {
      user = new User();
      user.userUuid = userUuid;
      await myDataSource.getRepository(User).save(user);
    }

    const newImage = new Image();

    newImage.imageURL = imageURL;
    newImage.uuid = uuid;
    newImage.location = location;
    newImage.description = description;
    newImage.tags = tags;
    newImage.user = user;

    await myDataSource.getRepository(Image).save(newImage);
  } catch (error) {
    throw error;
  }
};

const getImagesByUserUuid = async (userUuid: string) => {
  try {
    const userWithImages = await myDataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.images', 'image')
      .where('user.userUuid = :userUuid', { userUuid })
      .getMany();

    if (!userWithImages || userWithImages.length === 0) {
      return;
    }

    const userImages = userWithImages[0].images.map(image => ({
      uuid: image.uuid,
      imageURL: image.imageURL,
      author: userUuid,
      tags: image.tags,
    }));

    return userImages;
  } catch (error) {
    throw error;
  }
};

const getAllImages = async () => {
  return await myDataSource.getRepository(Image).find();
};

const deleteImage = async (imageUuid: string) => {
  const imageToDelete = await myDataSource.getRepository(Image).find({
    where: {
      uuid: imageUuid,
    },
  });

  if (!imageToDelete || imageToDelete.length === 0) {
    return false;
  }

  try {
    const url = imageToDelete[0].imageURL;
    const fileName = url.split('/').pop() || '';

    await storage.bucket(bucketName).file(fileName).delete();
  } catch (error) {
    console.error(error);
    return false;
  }

  await myDataSource.getRepository(Image).remove(imageToDelete);
  return true;
};

export default {
  uploadImageToStorage,
  saveImageToDatabase,
  validateImageData,
  getImagesByUserUuid,
  getAllImages,
  deleteImage,
};
