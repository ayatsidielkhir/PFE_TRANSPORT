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
    const dir = path.resolve(__dirname, '../../uploads/chauffeurs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Routes CRUD Chauffeurs
router.get('/', getChauffeurs);

// ✅ Utilisation de `.any()` au lieu de `.fields(...)` pour accepter fichiers dynamiques comme `customDocs`
router.post('/', upload.any(), addChauffeur);
router.put('/:id', upload.any(), updateChauffeur);

router.delete('/:id', deleteChauffeur);

// ✅ Télécharger les fichiers localement
router.get('/download/:filename', (req, res) => {
  const filePath = path.resolve(__dirname, '../../uploads/chauffeurs', req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Fichier introuvable' });
    return;
  }

  res.download(filePath);
});

export default router;
