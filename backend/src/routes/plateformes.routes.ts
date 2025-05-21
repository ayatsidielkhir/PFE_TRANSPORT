import express from 'express';
import multer from 'multer';
import {
  getPlatforms,
  addPlatform,
  deletePlatform,
  updatePlatform
} from '../controllers/platform.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/platforms' });

router.get('/', getPlatforms);
router.post('/', upload.single('logo'), addPlatform);
router.put('/:id', upload.single('logo'), updatePlatform);
router.delete('/:id', deletePlatform);

export default router;
