import { Router } from 'express';
import {
  getVehicules,
  createVehicule,
  updateVehicule,
  deleteVehicule
} from '../controllers/vehicule.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// 📁 Configurer Multer pour uploader dans /uploads/vehicules
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'vehicules');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 📌 GET tous les véhicules
router.get('/', getVehicules);

// 📌 POST nouveau véhicule avec fichiers
router.post(
  '/',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 }
  ]),
  createVehicule
);

// 📌 PUT modifier un véhicule avec fichiers
router.put(
  '/:id',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 }
  ]),
  updateVehicule
);

// 📌 DELETE un véhicule
router.delete('/:id', deleteVehicule);

export default router;
