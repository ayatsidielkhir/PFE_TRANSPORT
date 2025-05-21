import { Request, Response } from 'express';
import Chauffeur from '../models/Chauffeur';
import Vehicule from '../models/Vehicule';
import Trajet from '../models/trajet.model';

export const getDashboardStats = async (_: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [chauffeurs, vehicules, trajets] = await Promise.all([
      Chauffeur.countDocuments(),
      Vehicule.countDocuments(),
      Trajet.countDocuments({ date: { $gte: todayStart } }),
    ]);

    res.json({
      chauffeurs,
      vehicules,
      factures: 0, // temporairement désactivé
      trajets
    });
  } catch (err) {
    console.error('Erreur dans le dashboard:', err);
    res.status(500).json({ error: 'Erreur serveur dans le dashboard' });
  }
};
