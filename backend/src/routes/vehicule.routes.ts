import { Router, Request, Response } from 'express';
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

// ✅ Configuration de Multer pour le dossier des véhicules
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

const upload = multer({ storage });

// ✅ Récupérer tous les véhicules
router.get('/', getVehicules);

// ✅ Ajouter un véhicule avec upload
router.post(
  '/',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 },
    { name: 'vignette', maxCount: 1 },
    { name: 'agrement', maxCount: 1 },
    { name: 'carteVerte', maxCount: 1 },
    { name: 'extincteur', maxCount: 1 },
    { name: 'photoVehicule', maxCount: 1 }
  ]),
  addVehicule
);

// ✅ Modifier un véhicule
router.put(
  '/:id',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 },
    { name: 'vignette', maxCount: 1 },
    { name: 'agrement', maxCount: 1 },
    { name: 'carteVerte', maxCount: 1 },
    { name: 'extincteur', maxCount: 1 },
    { name: 'photoVehicule', maxCount: 1 }
  ]),
  updateVehicule
);

// ✅ Supprimer un véhicule
router.delete('/:id', deleteVehicule);

// ✅ Télécharger un seul fichier

  router.get('/download/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join('/mnt/data/uploads/vehicules', filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Fichier introuvable' });
      return;
    }

    res.download(filePath);
  });

// ✅ Télécharger tous les fichiers d’un véhicule en ZIP
  router.get('/:id/download', downloadVehiculeDocs);

  router.get('/download/:vehiculeId', downloadVehiculeDocs);

  export default router;
