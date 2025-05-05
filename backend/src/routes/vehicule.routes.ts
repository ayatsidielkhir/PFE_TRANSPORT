import express from 'express';
import {
  getVehicules,
  createVehicule,
  updateVehicule,
  deleteVehicule
} from '../controllers/vehicule.controller';
import upload from '../middleware/upload'; 

const router = express.Router();

router.get('/', getVehicules);
router.post('/', upload.single('carteGrise'), createVehicule);
router.put('/:id', upload.single('carteGrise'), updateVehicule);
router.delete('/:id', deleteVehicule);

export default router;
