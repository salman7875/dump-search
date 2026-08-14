import express from 'express';
import { uploadController } from './upload.controllers.js';
import { multerUpload } from '../../libs/multer/index.js';

const router = express.Router();

router.post('/', uploadController.uploadDoc);
router.post('/url', uploadController.getUploadUrl);

export default router;
