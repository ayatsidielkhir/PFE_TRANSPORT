import { Request, Response } from 'express';
import Chauffeur from '../models/Chauffeur';
import Vehicule from '../models/Vehicule';
import Trajet from '../models/trajet.model';
import Caisse from '../models/caisse.model';
import Charge from '../models/charge.model';
import { isBefore, isAfter, addDays } from 'date-fns';



 export const getNotifications = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const inSevenDays = addDays(now, 7);

    const chauffeurs = await Chauffeur.find({
      $or: [
        { dateExpirationCIN: { $exists: true } },
        { dateExpirationPermis: { $exists: true } },
        { dateExpirationVisa: { $exists: true } },
        { dateExpirationCasier: { $exists: true } }
      ]
    });

    const notifications: string[] = [];

    chauffeurs.forEach((c) => {
      const docs = [
        { label: '', date: c.dateExpirationCIN },
      ];

      docs.forEach(({ label, date }) => {
        if (!date) return;

        if (isBefore(date, now)) {
          notifications.push(`❗ Le ${label} de ${c.nom} ${c.prenom} est expiré !`);
        } else if (isBefore(date, inSevenDays)) {
          notifications.push(`⚠️ Le ${label} de ${c.nom} ${c.prenom} expire bientôt (${date.toLocaleDateString()})`);
        }
      });
    });

    res.json({ notifications });
  } catch (err) {
    console.error('Erreur notifications documents:', err);
    res.status(500).json({ error: 'Erreur serveur notifications' });
  }
};


// 📊 Statistiques globales
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

// 📈 Route: /api/dashboard/caisse-mensuelle
export const getCaisseMensuelle = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    const entreesMensuelles = Array(12).fill(0);
    const sortiesMensuelles = Array(12).fill(0);
    const mois = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    const entrees = await Caisse.find({
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    });

    const charges = await Charge.find({
      date: {
        $gte: new Date(`${currentYear}-01-01`),
        $lt: new Date(`${currentYear + 1}-01-01`)
      }
    });

    entrees.forEach((e) => {
      const moisIndex = new Date(e.date).getMonth();
      entreesMensuelles[moisIndex] += e.montant;
    });

    charges.forEach((c) => {
      const moisIndex = new Date(c.date).getMonth();
      sortiesMensuelles[moisIndex] += c.montant;
    });

    res.json({
      entreesMensuelles,
      sortiesMensuelles,
      mois
    });
  } catch (err) {
    console.error('Erreur agrégation caisse:', err);
    res.status(500).json({ error: 'Erreur serveur dans les données caisse' });
  }
};

// 🍩 Route: /api/dashboard/charges-par-type
export const getChargesParType = async (_req: Request, res: Response) => {
  try {
    const charges = await Charge.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$montant' }
        }
      },
      {
        $project: {
          type: '$_id',
          total: 1,
          _id: 0
        }
      }
    ]);

    res.json(charges);
  } catch (err) {
    console.error('Erreur agrégation des charges par type:', err);
    res.status(500).json({ error: 'Erreur lors de l’agrégation des charges' });
  }
};

// 📉 Route: /api/dashboard/chiffre-affaire-mensuel
export const getChiffreAffaireMensuel = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const months = Array.from({ length: 12 }, (_, i) => i); // Mois de 0 à 11

    const chiffreAffaire = await Promise.all(
      months.map(async (month) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);

        const [entrees, sorties, charges] = await Promise.all([
          Caisse.aggregate([
            {
              $match: {
                type: 'entrée',
                date: { $gte: start, $lt: end },
              },
            },
            { $group: { _id: null, total: { $sum: '$montant' } } },
          ]),
          Caisse.aggregate([
            {
              $match: {
                type: 'sortie',
                date: { $gte: start, $lt: end },
              },
            },
            { $group: { _id: null, total: { $sum: '$montant' } } },
          ]),
          Charge.aggregate([
            {
              $match: {
                date: { $gte: start, $lt: end },
              },
            },
            { $group: { _id: null, total: { $sum: '$montant' } } },
          ]),
        ]);

        const totalEntree = entrees[0]?.total || 0;
        const totalSortie = sorties[0]?.total || 0;
        const totalCharge = charges[0]?.total || 0;

        return {
          mois: start.toLocaleString('fr-FR', { month: 'short' }),
          revenuNet: totalEntree - (totalSortie + totalCharge),
        };
      })
    );

    res.json(chiffreAffaire);
  } catch (err) {
    console.error('Erreur CA mensuel :', err);
    res.status(500).json({ error: 'Erreur serveur CA mensuel' });
  }
};