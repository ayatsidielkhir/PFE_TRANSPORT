// dossierjuridique.routes.ts

import express from 'express';
import { getDossier, uploadDossier } from '../controllers/dossierjuridique.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuration de Multer pour gérer les fichiers
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve('/mnt/data/uploads/juridique'); // ✅ disque persistant
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Initialisation de Multer
const upload = multer({ storage });

// Routes
router.get('/', getDossier); // Récupérer le dossier juridique
router.post('/', upload.any(), uploadDossier); // Upload des fichiers

export default router;
