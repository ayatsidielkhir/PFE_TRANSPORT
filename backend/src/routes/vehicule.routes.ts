  import { Router, Request, Response ,RequestHandler} from 'express';
  import path from 'path';
  import fs from 'fs';
  import multer from 'multer';
  import {
    createVehicule,
    getVehicules,
    updateVehicule,
    deleteVehicule
  } from '../controllers/vehicule.controller';

  const router = Router();

  // ✅ Config Multer pour /mnt/data/uploads/vehicules
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

  // ✅ ROUTES CRUD

  // Tous les véhicules
  router.get('/', getVehicules);

  // Ajouter un véhicule avec fichiers
  router.post(
    '/',
    upload.fields([
      { name: 'carteGrise', maxCount: 1 },
      { name: 'assurance', maxCount: 1 },
      { name: 'vignette', maxCount: 1 },
      { name: 'agrement', maxCount: 1 },
      { name: 'carteVerte', maxCount: 1 },
      { name: 'extincteur', maxCount: 1 },
      { name: 'photoVehicule', maxCount: 1 } // si tu ajoutes ça dans ton modèle
    ]),
    createVehicule
  );

  // Modifier
  router.put(
      '/:id',
    upload.fields([
  { name: 'carteGrise', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'vignette', maxCount: 1 },
  { name: 'agrement', maxCount: 1 },
  { name: 'carteVerte', maxCount: 1 },
  { name: 'extincteur', maxCount: 1 },
  { name: 'photoVehicule', maxCount: 1 }, // ✅ ici aussi
]),

      updateVehicule
  );

  // Supprimer
  router.delete('/:id', deleteVehicule);

  router.get('/download/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join('/mnt/data/uploads/vehicules', filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Fichier introuvable' });
      return;
    }

    res.download(filePath);
  });

  export default router;
