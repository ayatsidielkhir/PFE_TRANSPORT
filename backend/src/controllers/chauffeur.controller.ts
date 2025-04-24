// backend/src/controllers/chauffeur.controller.ts
import { Request, Response } from 'express';
import Chauffeur from '../models/Chauffeur';

export const createChauffeur = async (req: Request, res: Response) => {
  try {
    const chauffeur = new Chauffeur(req.body);
    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
};

export const getAllChauffeurs = async (_req: Request, res: Response) => {
  try {
    const chauffeurs = await Chauffeur.find();
    res.status(200).json(chauffeurs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
// GET un seul chauffeur
export const getChauffeurById = async (req: Request, res: Response) => {
    try {
      const chauffeur = await Chauffeur.findById(req.params.id);
      if (!chauffeur) return res.status(404).json({ message: 'Chauffeur non trouvé' });
      res.status(200).json(chauffeur);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };
  
  // PUT modifier un chauffeur
  export const updateChauffeur = async (req: Request, res: Response) => {
    try {
      const updated = await Chauffeur.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Chauffeur non trouvé' });
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la mise à jour', error });
    }
  };
  
  // DELETE un chauffeur
  export const deleteChauffeur = async (req: Request, res: Response) => {
    try {
      const deleted = await Chauffeur.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Chauffeur non trouvé' });
      res.status(200).json({ message: 'Chauffeur supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression', error });
    }
  };
  