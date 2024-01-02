import { Request, Response } from 'express';
import imagesService from '../services/imagesService.js';
import Joi from 'joi';

const ImageDataSchema = Joi.object({
  userUuid: Joi.string().required(),
  images: Joi.array().required(),
});

const DeleteImageInputSchema = Joi.object({
  imageUuid: Joi.string().required(),
});

const uploadImage = async (req: Request, res: Response) => {
  const { userUuid, images } = req.body;

  try {
    await ImageDataSchema.validateAsync({ userUuid, images });
  } catch (error: any) {
    return res.status(400).json({
      errors: [
        {
          userUuid,
          message: error.details[0].message,
        },
      ],
    });
  }

  try {
    const validationErrors = [];

    for (const image of images) {
      const validationError = await imagesService.validateImageData(image);

      if (validationError) {
        validationErrors.push({
          uuid: image.uuid,
          message: validationError.message,
        });
      }
    }

    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors });
      return;
    }

    for (const image of images) {
      const uploadResult = await imagesService.uploadImageToStorage(
        image.image,
        image.uuid,
      );

      const imageDataForDatabase = {
        imageURL: uploadResult.imageUrl || '',
        uuid: image.uuid,
        location: image.location,
        description: image.description,
        tags: image.tags,
        userUuid,
      };

      await imagesService.saveImageToDatabase(imageDataForDatabase);
    }

    res.status(200).json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserImages = async (req: Request, res: Response) => {
  try {
    const userUuid = req.query?.uuid as string;

    if (!userUuid) {
      const allImages = await imagesService.getAllImages();
      return res.status(200).json(allImages);
    }

    const userImages = await imagesService.getImagesByUserUuid(userUuid);

    if (!userImages || userImages.length === 0) {
      return res
        .status(404)
        .json({ error: 'User not found or has no images yet' });
    }

    res.status(200).json(userImages);
  } catch (error) {
    console.error(error);
    res.status(500).send(error).end();
  }
};

const deleteImage = async (req: Request, res: Response) => {
  try {
    const imageUuid = req.query?.uuid as string;

    try {
      await DeleteImageInputSchema.validateAsync({ imageUuid });
    } catch (error: any) {
      return res.status(404).json({ message: 'Please provide image uuid' });
    }

    const imageDeleted = await imagesService.deleteImage(imageUuid);

    if (imageDeleted) {
      res.status(200).json({ message: 'Image successfully deleted' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error).end();
  }
};

export default {
  uploadImage,
  getUserImages,
  deleteImage,
};
