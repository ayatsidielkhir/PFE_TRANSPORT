import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import {
  addChauffeur,
  getChauffeurs,
  deleteChauffeur,
  updateChauffeur
} from '../controllers/chauffeur.controller';
import { RequestHandler } from 'express';



const router = Router();

// ✅ Configuration Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'chauffeurs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


const upload = multer({ storage });


const downloadFile: RequestHandler = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'chauffeurs', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Fichier introuvable' });
    return;
  }

  res.download(filePath);
};

// ✅ Routes

// 🔹 Récupérer tous les chauffeurs
router.get('/', getChauffeurs);

// 🔹 Ajouter un chauffeur avec fichiers
router.post(
  '/',
  upload.fields([
    { name: 'scanPermis', maxCount: 1 },
    { name: 'scanVisa', maxCount: 1 },
    { name: 'scanCIN', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'certificatBonneConduite', maxCount: 1 }
  ]),
  addChauffeur
);

// 🔹 Modifier un chauffeur
router.put(
  '/:id',
  upload.fields([
    { name: 'scanPermis', maxCount: 1 },
    { name: 'scanVisa', maxCount: 1 },
    { name: 'scanCIN', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'certificatBonneConduite', maxCount: 1 }
  ]),
  updateChauffeur
);

// 🔹 Supprimer un chauffeur
router.delete('/:id', deleteChauffeur);

// 🔹 Télécharger un fichier
router.get('/download/:filename', downloadFile);

export default router;
