import { Request, Response } from 'express';
import Charge from '../models/charge.model';

export const getCharges = async (_req: Request, res: Response) => {
  try {
    const charges = await Charge.find()
      .populate('chauffeur', 'nom prenom') // ne récupère que le nom et prénom
      .sort({ date: -1 });

    res.json(charges);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const addCharge = async (req: Request, res: Response) => {
  try {
    const charge = new Charge(req.body);
    await charge.save();
    res.status(201).json(charge);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création', error: err });
  }
};

export const updateCharge = async (req: Request, res: Response) => {
  try {
    const updated = await Charge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Erreur modification', error: err });
  }
};

export const deleteCharge = async (req: Request, res: Response) => {
  try {
    await Charge.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Charge supprimée' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err });
  }
};
