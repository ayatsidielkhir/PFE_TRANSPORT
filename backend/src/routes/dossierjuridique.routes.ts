import express from 'express';
import { getDossier, uploadDossier } from '../controllers/dossierjuridique.controller';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/juridique'),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.get('/', getDossier);
router.post('/', upload.fields([
  { name: 'modelJ' }, { name: 'statut' }, { name: 'rc' },
  { name: 'identifiantFiscale' }, { name: 'cinGerant' }, { name: 'doc1007' }
]), uploadDossier);

export default router;
