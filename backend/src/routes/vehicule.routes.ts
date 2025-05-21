import { Router, Request, Response } from 'express';
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

// ✅ Config Multer pour stocker dans uploads/chauffeurs
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const dir = path.join(process.cwd(), 'uploads', 'chauffeurs'); // même dossier que chauffeurs
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Récupérer tous les véhicules
router.get('/', getVehicules);

// ✅ Ajouter un véhicule avec fichiers
router.post(
  '/',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 }
  ]),
  createVehicule
);

// ✅ Modifier un véhicule avec fichiers
router.put(
  '/:id',
  upload.fields([
    { name: 'carteGrise', maxCount: 1 },
    { name: 'assurance', maxCount: 1 }
  ]),
  updateVehicule
);

// ✅ Supprimer un véhicule
router.delete('/:id', deleteVehicule);

// ✅ Télécharger un fichier associé à un véhicule
router.get('/download/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'chauffeurs', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier introuvable' });
  }

  res.download(filePath);
});

export default router;
