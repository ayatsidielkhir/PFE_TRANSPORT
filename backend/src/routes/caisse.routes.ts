import { Router } from 'express';
import {
  getOperations,
  addOperation,
  updateOperation,
  deleteOperation
} from '../controllers/caisse.controller';

import upload from '../middleware/upload'; // ✅ Utilisation du middleware global

const router = Router();

// ✅ Routes
router.get('/', getOperations);
router.post('/', upload.single('justificatif'), addOperation);
router.put('/:id', upload.single('justificatif'), updateOperation);
router.delete('/:id', deleteOperation);

export default router;
