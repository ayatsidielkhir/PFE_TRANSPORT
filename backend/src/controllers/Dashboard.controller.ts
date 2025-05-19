import { Request, Response } from 'express';
import Chauffeur from '../models/Chauffeur';
import Vehicule from '../models/Vehicule';
import Facture from '../models/facture';
import Trajet from '../models/trajet.model';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [chauffeurs, vehicules, factures, trajets] = await Promise.all([
      Chauffeur.countDocuments(),
      Vehicule.countDocuments(),
      Facture.countDocuments({ date: { $gte: new Date().setHours(0, 0, 0, 0) } }),
      Trajet.countDocuments({ date: { $gte: new Date().setHours(0, 0, 0, 0) } }),
    ]);

    const alerts = [
      { text: 'Visa de chauffeur expire dans 20 jours', color: '#FFB400' },
      { text: 'Contrat de chauff. expire dans 5 jours', color: '#FF5C00' },
      { text: 'Assurance véhicule expire demain', color: '#FF1E1E' },
    ];

    const recentActivity = [
      'Nouveau trajet ajouté',
      'Chauffeur ajouté',
      'Contrat de chauff. mis à jour',
    ];

    const facturesDuJour = await Facture.find({
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    }).limit(5);

    res.json({
      stats: { chauffeurs, vehicules, factures, trajets },
      alerts,
      recentActivity,
      factures: facturesDuJour,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
