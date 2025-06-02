import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDossier, uploadDossier } from '../controllers/dossierjuridique.controller';


const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve('/mnt/data/uploads/juridique');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.get('/', getDossier);
router.post('/', upload.any(), uploadDossier);

export default router;
