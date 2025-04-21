import express from 'express';
import { uploadAvatar, uploadServiceImage } from '../controllers/upload';
import { protect, authorize } from '../middleware/auth';
import upload from '../config/multer';

const router = express.Router();

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/service', protect, authorize('provider', 'admin'), upload.single('image'), uploadServiceImage);

export { router };
