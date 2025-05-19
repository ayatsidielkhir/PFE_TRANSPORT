import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  addChauffeur,
  getChauffeurs,
  deleteChauffeur
} from '../controllers/chauffeur.controller';

const router = express.Router();

// ✅ Configuration améliorée du stockage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'chauffeurs'));
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ GET chauffeurs
router.get('/', getChauffeurs);

// ✅ POST chauffeur avec plusieurs fichiers
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

// ✅ DELETE chauffeur
router.delete('/:id', deleteChauffeur);

export default router;
