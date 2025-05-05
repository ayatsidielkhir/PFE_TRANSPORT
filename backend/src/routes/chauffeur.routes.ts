import express from 'express';
import multer from 'multer';
import {
  addChauffeur,
  getChauffeurs,
  deleteChauffeur
} from '../controllers/chauffeur.controller';

const router = express.Router();

// ✅ Configurer le dossier d’upload
const upload = multer({ dest: 'uploads/' });

router.get('/', getChauffeurs);

router.post(
  '/',
  upload.fields([
    { name: 'scanPermis', maxCount: 1 },
    { name: 'scanVisa', maxCount: 1 },
    { name: 'scanCIN', maxCount: 1 }
  ]),
  addChauffeur
);

router.delete('/:id', deleteChauffeur);

export default router;
