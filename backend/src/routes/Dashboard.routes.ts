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
  router.get('/chiffre-affaire-mensuel', getChiffreAffaireMensuel);

  //  État de caisse (entrées vs sorties mensuelles)
  router.get('/caisse-mensuelle', getCaisseMensuelle);

  //  Notifications du jour
  router.get('/notifications', getNotifications);

  // Répartition des charges par type (pie chart)
  router.get('/charges-par-type', getChargesParType);

  export default router;
