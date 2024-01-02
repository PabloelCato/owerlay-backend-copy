import locationsService from '../services/locationsService.js';
import { Request, Response } from 'express';
import Joi from 'joi';

const LocationInputSchema = Joi.object({
  input: Joi.string().required(),
});

const getLocations = async (req: Request, res: Response) => {
  try {
    const input = req.query.input as string;

    try {
      await LocationInputSchema.validateAsync({ input });
    } catch (error: any) {
      return res.status(400).json({ error: 'Invalid location input' });
    }

    const locations = await locationsService.getLocations(input);
    res.status(200).send(locations).end();
  } catch (error) {
    res.status(500).send(error).end();
    console.error(error);
  }
};

export default { getLocations };
