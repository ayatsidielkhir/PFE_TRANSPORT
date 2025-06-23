import express from 'express';
import { getTrajetNotifications, getCaisseNotifications, getChargeNotifications } from '../controllers/notifications.controller';

const router = express.Router();

router.get('/trajets', getTrajetNotifications);
router.get('/caisse', getCaisseNotifications);
router.get('/charges', getChargeNotifications);

export default router;
