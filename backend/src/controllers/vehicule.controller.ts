import { Request, Response } from 'express';
import Vehicule from '../models/Vehicule';

export const getVehicules = async (_req: Request, res: Response) => {
  try {
    const vehicules = await Vehicule.find().sort({ createdAt: -1 });
    res.status(200).json(vehicules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const createVehicule = async (req: Request, res: Response) => {
  try {
    const {
      nom,
      matricule,
      type,
      kilometrage,
      controle_technique,
      assurance
    } = req.body;

    // Récupérer le fichier s'il existe
    const carteGrise = req.file?.filename || '';

    // Créer un objet de véhicule
    const vehicule = new Vehicule({
      nom,
      matricule,
      type,
      kilometrage: Number(kilometrage),
      controle_technique,
      assurance,
      carteGrise
    });

    await vehicule.save();
    res.status(201).json(vehicule);
  } catch (err) {
    console.error('❌ Erreur création véhicule :', err);
    res.status(400).json({ message: 'Erreur création', error: err });
  }
};

export const updateVehicule = async (req: Request, res: Response) => {
  try {
    if (req.file) req.body.carteGrise = req.file.filename;

    const updated = await Vehicule.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        kilometrage: Number(req.body.kilometrage)
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Erreur modification véhicule :', err);
    res.status(400).json({ message: 'Erreur modification', error: err });
  }
};

export const deleteVehicule = async (req: Request, res: Response) => {
  try {
    await Vehicule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Véhicule supprimé' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err });
  }
};
