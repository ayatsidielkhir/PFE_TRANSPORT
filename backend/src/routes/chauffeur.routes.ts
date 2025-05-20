// ✅ chauffeur.routes.ts — complet et corrigé

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

const router = Router();

// ✅ Config multer pour stockage des fichiers
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'chauffeurs'));
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Récupérer tous les chauffeurs
router.get('/', getChauffeurs);

// ✅ Ajouter un chauffeur avec fichiers
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

// ✅ Modifier un chauffeur
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

// ✅ Supprimer un chauffeur
router.delete('/:id', deleteChauffeur);

// ✅ Télécharger un fichier (force le téléchargement)
router.get('/download/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads/chauffeurs', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier introuvable' });
  }

  res.download(filePath);
});

export default router;
