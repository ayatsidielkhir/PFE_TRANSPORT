import { Request, Response } from 'express';

import Trajet from '../models/trajet.model';
import Vehicule from '../models/Vehicule';  

export const getAllTrajets = async (req: Request, res: Response) => {
  try {
    const trajets = await Trajet.find()
      .populate('chauffeur', 'nom prenom')
      .populate('vehicule', 'nom matricule type');  
    
    console.log('Trajets récupérés:', trajets);
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des trajets.' });
  }
};


export const createTrajet = async (req: Request, res: Response) => {
  try {
    const { depart, arrivee, date, chauffeur, vehicule, distanceKm, consommationL } = req.body;
    
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
