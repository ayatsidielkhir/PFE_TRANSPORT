import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getDossier,
  uploadDossier,
  deleteFileFromDossier,
  renameDossierField 
} from '../controllers/dossierjuridique.controller';

const router = express.Router();

// 📁 Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve('/mnt/data/uploads/juridique');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 🔹 Routes
router.get('/', getDossier); // GET tous les fichiers
router.post('/', upload.any(), uploadDossier); // POST upload (multi-fichiers)
router.delete('/:field', deleteFileFromDossier); // DELETE fichier spécifique
router.put('/rename', renameDossierField);

export default router;
