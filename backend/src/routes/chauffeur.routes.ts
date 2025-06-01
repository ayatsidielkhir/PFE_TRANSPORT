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

// ✅ Configuration Multer avec disque persistant Render
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve('/mnt/data/uploads', 'chauffeurs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Téléchargement de fichier
const downloadFile: RequestHandler = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve('/mnt/data/uploads', 'chauffeurs', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Fichier introuvable' });
    return;
  }

  res.download(filePath);
};

// ✅ Routes

router.get('/', getChauffeurs);

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

router.delete('/:id', deleteChauffeur);
router.get('/download/:filename', downloadFile);

export default router;
