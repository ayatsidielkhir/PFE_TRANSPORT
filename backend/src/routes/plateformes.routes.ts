import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getPlatforms,
  addPlatform,
  deletePlatform,
  updatePlatform
} from '../controllers/platform.controller';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join('/mnt/data/uploads/platforms');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.get('/', getPlatforms);
router.post('/', upload.single('logo'), addPlatform);
router.put('/:id', upload.single('logo'), updatePlatform);
router.delete('/:id', deletePlatform);

export default router;
