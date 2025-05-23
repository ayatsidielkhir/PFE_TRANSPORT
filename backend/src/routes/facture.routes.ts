import express from 'express';
import {
  generateManualFacture,
  getAllFactures,
  getLatestFacture
} from '../controllers/Facture.controller';

const router = express.Router();

// 🔁 Liste des factures (historique)
router.get('/', getAllFactures);

// 📄 Dernière facture
router.get('/latest', getLatestFacture);

// 🧾 Génération et enregistrement d’une facture manuelle
router.post('/manual', generateManualFacture);

export default router;
