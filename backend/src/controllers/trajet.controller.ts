import { RequestHandler } from 'express';
import Trajet from '../models/trajet.model';
import Vehicule from '../models/Vehicule';

// ✅ Récupérer tous les trajets avec filtres
export const getAllTrajets: RequestHandler = async (req, res) => {
  try {
    const { mois, partenaire } = req.query;
    const filter: any = {};

    if (mois) {
      const [year, month] = (mois as string).split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    if (partenaire) {
      filter.partenaire = partenaire;
    }

    const trajets = await Trajet.find(filter)
      .populate('chauffeur', 'nom prenom')
      .populate('vehicule', 'nom matricule type')
      .populate('partenaire', 'nom ice');

    console.log('Filtres appliqués:', filter);
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des trajets.' });
  }
};

// ✅ Créer un trajet
export const createTrajet: RequestHandler = async (req, res) => {
  try {
    const {
      depart,
      arrivee,
      date,
      chauffeur,
      vehicule,
      distanceKm,
      consommationL,
      consommationMAD,
      partenaire,
      importExport
    } = req.body;

    if (!depart || !arrivee || !date || !chauffeur || !vehicule || !distanceKm || !consommationL) {
      res.status(400).json({ error: 'Les informations sont manquantes.' });
      return;
    }

    const trajet = new Trajet({
      depart,
      arrivee,
      date,
      chauffeur,
      vehicule,
      distanceKm,
      consommationL,
      consommationMAD,
      partenaire,
      importExport
    });

    await trajet.save();
    res.status(201).json(trajet);
  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error);
    res.status(500).json({ error: 'Erreur lors de la création du trajet.' });
  }
};

// ✅ Modifier un trajet
export const updateTrajet: RequestHandler = async (req, res) => {
  try {
    const trajet = await Trajet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trajet);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du trajet.' });
  }
};

// ✅ Supprimer un trajet
export const deleteTrajet: RequestHandler = async (req, res) => {
  try {
    await Trajet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trajet supprimé avec succès.' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression du trajet.' });
  }
};

// ✅ Obtenir les trajets facturables (filtrés par mois et partenaire)
export const getFacturables: RequestHandler = async (req, res) => {
  try {
    const { mois, partenaire } = req.query;

    if (!mois || !partenaire) {
      res.status(400).json({ message: 'Mois et partenaire requis.' });
      return;
    }

    const [year, month] = (mois as string).split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const trajets = await Trajet.find({
      partenaire,
      date: { $gte: start, $lte: end }
    }).select('date depart arrivee remorque totalHT');

    res.json(trajets);
  } catch (err) {
    console.error('Erreur getFacturables :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
