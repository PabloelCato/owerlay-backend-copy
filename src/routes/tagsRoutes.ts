import express from 'express';
import tagsController from '../controllers/tagsController.js';

const router = express.Router();

router.get('/', tagsController.getTags);

export default router;
