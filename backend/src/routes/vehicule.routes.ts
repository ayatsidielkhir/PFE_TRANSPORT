import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {
  addVehicule,
  getVehicules,
  updateVehicule,
  deleteVehicule,
  downloadVehiculeDocs
} from '../controllers/vehicule.controller';

const router = Router();

// === Multer config ===
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join('/mnt/data/uploads', 'vehicules');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// ✅ Filter for image/pdf types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isPhoto = file.fieldname === 'photoVehicule';
  if (isPhoto) {
    if (/^image\/(jpeg|png|jpg|webp)$/.test(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Seules les images sont autorisées pour le champ photoVehicule.'));
    }
  } else {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    } else {
      return cb(new Error(`Seuls les fichiers PDF sont autorisés pour le champ ${file.fieldname}.`));
    }
  }
};

const upload = multer({ storage, fileFilter });

const fields = [
  { name: 'carteGrise', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'vignette', maxCount: 1 },
  { name: 'agrement', maxCount: 1 },
  { name: 'carteVerte', maxCount: 1 },
  { name: 'extincteur', maxCount: 1 },
  { name: 'photoVehicule', maxCount: 1 }
];

// === Routes ===

router.get('/', getVehicules);

// ✅ POST avec gestion des erreurs d'upload
router.post(
  '/',
  (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  addVehicule
);

// ✅ PUT avec gestion des erreurs d'upload
router.put(
  '/:id',
  (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  updateVehicule
);

router.delete('/:id', deleteVehicule);

export default router;
