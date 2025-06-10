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

router.get('/', getVehicules);

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err: any) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  addVehicule
);

router.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err: any) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  updateVehicule
);

router.delete('/:id', deleteVehicule);

export default router;
