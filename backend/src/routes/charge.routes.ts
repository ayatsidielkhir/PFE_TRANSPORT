import express from 'express';
import {
  getCharges,
  addCharge,
  updateCharge,
  deleteCharge
} from '../controllers/charge.controller';

const router = express.Router();

router.get('/', getCharges);
router.post('/', addCharge);
router.put('/:id', updateCharge);
router.delete('/:id', deleteCharge);

export default router;
