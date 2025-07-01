import { Router } from 'express';
import {
  getDashboardStats,
  getCaisseMensuelle,
  getChiffreAffaireMensuel,
  getNotifications,
  getChargesParType
} from '../controllers/Dashboard.controller';

const router = Router();

// Statistiques globales (cartes)
router.get('/admin/dashboard', getDashboardStats);

// Chiffre d'affaires mensuel (revenus - charges)
router.get('/dashboard/chiffre-affaire-mensuel', getChiffreAffaireMensuel);

//  État de caisse (entrées vs sorties mensuelles)
router.get('/dashboard/caisse-mensuelle', getCaisseMensuelle);

//  Notifications du jour
router.get('/dashboard/notifications', getNotifications);

// Répartition des charges par type (pie chart)
router.get('/dashboard/charges-par-type', getChargesParType);

export default router;
