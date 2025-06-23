
import { RequestHandler } from 'express';
import Trajet from '../models/trajet.model';
import Caisse from '../models/caisse.model';
import Charge from '../models/charge.model';

export const getTrajetNotifications: RequestHandler = async (req, res) => {
  try {
    const trajets = await Trajet.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('chauffeur', 'nom prenom');

    const notifications = trajets.map(t => ({
      type: 'trajet',
message: `Nouveau trajet: ${t.depart} → ${t.arrivee} par ${t.chauffeur.nom?.toUpperCase()}`,
      date: t.date
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications de trajets.' });
  }
};
export const getCaisseNotifications: RequestHandler = async (_req, res) => {
  try {
    const operations = await Caisse.find().sort({ date: -1 }).limit(5);

    const notifications = operations.map(op => ({
      type: 'caisse',
      message: `${op.type === 'Entrée' ? 'Entrée' : 'Sortie'} caisse: ${op.type === 'Entrée' ? '+' : '-'}${op.montant} MAD pour ${op.sujet}`,
      date: op.date
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications de caisse.' });
  }
};
export const getChargeNotifications: RequestHandler = async (_req, res) => {
  try {
    const charges = await Charge.find()
      .sort({ date: -1 })
      .limit(5);

    const notifications = charges.map(ch => ({
      type: 'charge',
      message: `Charge '${ch.type}' ajoutée: ${ch.montant} MAD`,
      date: ch.date
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications de charges.' });
  }
};