import tagsService from '../services/tagsService.js';
import { Request, Response } from 'express';

const getTags = async (_: Request, res: Response) => {
  try {
    const tags = await tagsService.getTags();
    res.status(200).send(tags).end();
  } catch (error) {
    res.status(500).send(error).end();
    console.error(error);
  }
};

export default { getTags };
