import express from 'express';
import { getDashboardStats, getCaisseMensuelle, getChargesParType,getChiffreAffaireMensuel } from '../controllers/Dashboard.controller';
import { getNotifications } from '../controllers/Dashboard.controller';

const router = express.Router();

// Route pour les statistiques générales du dashboard
router.get('/', getDashboardStats);

// Nouvelle route pour le graphique Entrées vs Sorties
router.get('/caisse-mensuelle', getCaisseMensuelle);
router.get('/charges-par-type', getChargesParType);
router.get('/notifications', getNotifications);
router.get('/chiffre-affaire-mensuel', getChiffreAffaireMensuel);
export default router;