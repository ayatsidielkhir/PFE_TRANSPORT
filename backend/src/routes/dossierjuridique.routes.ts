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
    const dir = path.resolve(__dirname, '../../uploads/juridique');
    fs.mkdirSync(dir, { recursive: true }); // Crée le répertoire si nécessaire
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nom unique pour éviter les conflits
  }
});

// Initialisation de Multer
const upload = multer({ storage });

// Routes
router.get('/', getDossier); // Récupérer le dossier juridique
router.post('/', upload.any(), uploadDossier); // Upload des fichiers

export default router;
