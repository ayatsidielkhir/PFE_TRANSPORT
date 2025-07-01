  import { Request, Response } from 'express';
  import Chauffeur from '../models/Chauffeur';
  import Vehicule from '../models/Vehicule';
  import Facture from '../models/facture';
  import Trajet from '../models/trajet.model';
  import Caisse from '../models/caisse.model';
  import Charge from '../models/charge.model';

  // 1. Statistiques générales
  export const getDashboardStats = async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const chauffeurs = await Chauffeur.countDocuments();
      const vehicules = await Vehicule.countDocuments();
      const factures = await Facture.countDocuments({ date: today });
      const trajets = await Trajet.countDocuments({ date: today });

      res.json({ chauffeurs, vehicules, factures, trajets });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  };

  // 2. Graphique Caisse (Entrées vs Sorties par mois)
  export const getCaisseMensuelle = async (req: Request, res: Response) => {
    try {
      const caisseData = await Caisse.find();
      const mois = Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('fr-FR', { month: 'short' })
      );
      const entreesMensuelles = Array(12).fill(0);
      const sortiesMensuelles = Array(12).fill(0);

      caisseData.forEach((entry) => {
        const m = new Date(entry.date).getMonth();
        if (entry.type === 'Entrée') entreesMensuelles[m] += entry.montant;
        if (entry.type === 'Sortie') sortiesMensuelles[m] += entry.montant;
      });

      res.json({ mois, entreesMensuelles, sortiesMensuelles });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération de la caisse mensuelle' });
    }
  };

  // 3. Graphique Chiffre d'affaires mensuel
  export const getChiffreAffaireMensuel = async (req: Request, res: Response) => {
    try {
      const revenuNetData = Array(12).fill(null).map((_, i) => ({
        mois: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }),
        revenu: 0,
        depenses: 0,
        revenuNet: 0
      }));

      const factures = await Facture.find();
      factures.forEach(f => {
        const m = new Date(f.date).getMonth();
        revenuNetData[m].revenu += f.totalTTC || 0;
      });

      const charges = await Charge.find();
      charges.forEach(c => {
        const m = new Date(c.date).getMonth();
        revenuNetData[m].depenses += c.montant || 0;
      });

      revenuNetData.forEach(m => m.revenuNet = m.revenu - m.depenses);
      res.json(revenuNetData);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du chiffre d\'affaires mensuel' });
    }
  };

  // 4. Notifications récentes
  export const getNotifications = async (req: Request, res: Response) => {
    try {
      const notifications: string[] = [];

      const trajets = await Trajet.find().sort({ date: -1 }).limit(3).populate('partenaire');
      trajets.forEach(t => {
        const partenaireNom = typeof t.partenaire === 'object' && t.partenaire !== null && 'nom' in t.partenaire
          ? (t.partenaire as any).nom
          : '';
        notifications.push(`TRAJET::${t.date}::Nouvelle trajet. ${t.depart} ➝ ${t.arrivee} par ${partenaireNom}`);
      });

      const entrees = await Caisse.find({ type: 'entree' }).sort({ date: -1 }).limit(2);
      entrees.forEach(c => {
        notifications.push(`CAISSE::${c.date}::Entrée caisse : +${c.montant} MAD pour ${c.motif}`);
      });

      const charges = await Charge.find().sort({ date: -1 }).limit(2);
      charges.forEach(c => {
        notifications.push(`CHARGE::${c.date}::Charge "${c.type}" ajoutée : ${c.montant} MAD`);
      });

      res.json({ notifications });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
    }
  };

  // 5. Répartition des charges par type (pour le Pie chart)
  export const getChargesParType = async (req: Request, res: Response) => {
    try {
      const charges = await Charge.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: '$montant' }
          }
        }
      ]);
      const formatted = charges.map(c => ({ type: c._id, total: c.total }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des charges par type' });
    }
  };
