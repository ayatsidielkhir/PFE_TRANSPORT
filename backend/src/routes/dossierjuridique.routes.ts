import express from 'express';
import { getDossier, uploadDossier } from '../controllers/dossierjuridique.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuration de stockage
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

// Accepte tous les fichiers, quel que soit leur champ
const upload = multer({ storage });

router.get('/', getDossier);
router.post('/', upload.any(), uploadDossier); // ✅ utilise any()

export default router;
