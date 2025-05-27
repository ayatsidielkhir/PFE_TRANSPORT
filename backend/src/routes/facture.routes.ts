import express from 'express';
import {
  generateManualFacture,
  getAllFactures,
  getLatestFacture,deleteFacture,updateFacture, getFactureById,updateStatutFacture
} from '../controllers/Facture.controller';


const router = express.Router();
router.get('/:id', getFactureById);

router.get('/', getAllFactures);
router.get('/latest', getLatestFacture);
router.post('/manual', generateManualFacture);

router.delete('/:id', deleteFacture);
router.put('/:id', updateFacture);
router.put('/:id/statut', updateStatutFacture);




export default router;
