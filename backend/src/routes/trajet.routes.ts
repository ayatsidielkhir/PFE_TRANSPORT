import express from 'express';
import { getAllTrajets, createTrajet, updateTrajet, deleteTrajet } from '../controllers/trajet.controller';

const router = express.Router();

router.get('/', getAllTrajets);
router.post('/', createTrajet);
router.put('/:id', updateTrajet);
router.delete('/:id', deleteTrajet);

export default router;
