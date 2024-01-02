import express from 'express';
import imagesController from '../controllers/imagesController.js';

const router = express.Router();

router.post('/', imagesController.uploadImage);
router.get('/', imagesController.getUserImages);
router.delete('/', imagesController.deleteImage);

export default router;
