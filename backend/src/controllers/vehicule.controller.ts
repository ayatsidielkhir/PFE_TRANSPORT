import { Request, Response } from 'express';
import Vehicule from '../models/Vehicule';

// 🔹 Créer
export const createVehicule = async (req: Request, res: Response) => {
  try {
    const vehicule = new Vehicule(req.body);
    await vehicule.save();
    res.status(201).json(vehicule);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
};

// 🔹 Lire tous
export const getAllVehicules = async (_req: Request, res: Response) => {
  try {
    const vehicules = await Vehicule.find();
    res.status(200).json(vehicules);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// 🔹 Lire un seul
export const getVehiculeById = async (req: Request, res: Response) => {
  try {
    const vehicule = await Vehicule.findById(req.params.id);
    if (!vehicule) return res.status(404).json({ message: 'Non trouvé' });
    res.status(200).json(vehicule);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// 🔹 Modifier
export const updateVehicule = async (req: Request, res: Response) => {
  try {
    const updated = await Vehicule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Non trouvé' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Erreur de mise à jour', error });
  }
};

// 🔹 Supprimer
export const deleteVehicule = async (req: Request, res: Response) => {
  try {
    const deleted = await Vehicule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Non trouvé' });
    res.status(200).json({ message: 'Véhicule supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur suppression', error });
  }
};
