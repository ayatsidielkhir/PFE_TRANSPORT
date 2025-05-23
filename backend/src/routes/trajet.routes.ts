import express from 'express';
import { getAllTrajets, createTrajet, updateTrajet, deleteTrajet,getFacturables} from '../controllers/trajet.controller';

const router = express.Router();

router.get('/', getAllTrajets);
router.post('/', createTrajet);
router.put('/:id', updateTrajet);
router.delete('/:id', deleteTrajet);
router.get('/facturables', getFacturables); // ✅ ajoute cette ligne

export default router;
