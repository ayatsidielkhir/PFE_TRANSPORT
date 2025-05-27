import express from 'express';
import {
  getVehicules,
  createVehicule,
  updateVehicule,
  deleteVehicule
} from '../controllers/vehicule.controller';

import upload from '../middleware/upload'; // le fichier unique

const router = express.Router();

router.get('/', getVehicules);
router.post('/', upload.fields([
  { name: 'carteGrise', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'vignette', maxCount: 1 },
  { name: 'agrement', maxCount: 1 },
  { name: 'carteVerte', maxCount: 1 },
  { name: 'extincteur', maxCount: 1 }
]), createVehicule);

router.put('/:id', upload.fields([
  { name: 'carteGrise', maxCount: 1 },
  { name: 'assurance', maxCount: 1 },
  { name: 'vignette', maxCount: 1 },
  { name: 'agrement', maxCount: 1 },
  { name: 'carteVerte', maxCount: 1 },
  { name: 'extincteur', maxCount: 1 }
]), updateVehicule);

router.delete('/:id', deleteVehicule);

export default router;
