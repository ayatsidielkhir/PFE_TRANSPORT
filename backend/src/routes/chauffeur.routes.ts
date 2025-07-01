import { Router } from 'express';
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

// ✅ Configuration Multer (upload local)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join('/mnt/data/uploads', 'chauffeurs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ CRUD Chauffeurs
router.get('/', getChauffeurs);

router.post(
  '/',
  upload.any(), // ✅ Autorise tous les fichiers (scanCIN, autresDocs, etc.)
  addChauffeur
);

router.put(
  '/:id',
  upload.any(), // ✅ même logique pour la mise à jour
  updateChauffeur
);

router.delete('/:id', deleteChauffeur);

// ✅ Télécharger un fichier
router.get('/download/:filename', (req, res) => {
  const filePath = path.join('/mnt/data/uploads/chauffeurs', req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Fichier introuvable' });
    return;
  }

  res.download(filePath);
});

export default router;
