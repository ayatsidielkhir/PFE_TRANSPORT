import { Request, Response } from 'express';
import Trajet from '../models/trajet.model';
import Vehicule from '../models/Vehicule';

export const getAllTrajets = async (req: Request, res: Response) => {
  try {
    const { mois, partenaire } = req.query;

    const filter: any = {};

    // Filtrer par mois (ex. "2025-05")
    if (mois) {
      const [year, month] = (mois as string).split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    // Filtrer par partenaire
    if (partenaire) {
      filter.partenaire = partenaire;
    }

    const trajets = await Trajet.find(filter)
      .populate('chauffeur', 'nom prenom')
      .populate('vehicule', 'nom matricule type')
      .populate('partenaire', 'nom');

    console.log('Filtres appliqués:', filter);
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des trajets.' });
  }
};

export const createTrajet = async (req: Request, res: Response) => {
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
      return res.status(400).json({ error: 'Les informations sont manquantes.' });
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

export const updateTrajet = async (req: Request, res: Response) => {
  try {
    const trajet = await Trajet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trajet);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du trajet.' });
  }
};

export const deleteTrajet = async (req: Request, res: Response) => {
  try {
    await Trajet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trajet supprimé avec succès.' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression du trajet.' });
  }
};


export const getFacturables = async (req: Request, res: Response) => {
  try {
    const { mois, partenaire } = req.query;

    if (!mois || !partenaire) {
      return res.status(400).json({ message: 'Mois et partenaire requis.' });
    }

    const [year, month] = (mois as string).split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const trajets = await Trajet.find({
      partenaire,
      date: { $gte: start, $lte: end }
    }).select('date depart arrivee remorque totalHT'); // ⚠️ ajoute "remorque" si tu l’as dans ton modèle

    res.json(trajets);
  } catch (err) {
    console.error('Erreur getFacturables :', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
