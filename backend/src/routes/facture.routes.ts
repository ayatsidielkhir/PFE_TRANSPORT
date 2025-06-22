import express from 'express';
import {
  generateManualFacture,
  getAllFactures,
  getLatestFacture,
  deleteFacture,
  updateFacture,
  getFactureById,
  updateStatutFacture,
  generateAutoFacture 
} from '../controllers/Facture.controller';


const router = express.Router();

router.get('/', getAllFactures);
router.get('/latest', getLatestFacture);
router.get('/:id', getFactureById);
router.post('/manual', generateManualFacture);
router.put('/:id', updateFacture);
router.put('/:id/statut', updateStatutFacture);
router.delete('/:id', deleteFacture);

router.post('/auto', generateAutoFacture);

export default router;
