// backend/routes/facture.route.ts
import express from 'express';
import { generateManualFacture,updateFacture} from '../controllers/Facture.controller';

const router = express.Router();

// Route pour générer une facture manuellement depuis un trajet
router.post('/manual', generateManualFacture);
// Mettre à jour une facture (ex: statut payé)
router.put('/:id', updateFacture);

export default router;
