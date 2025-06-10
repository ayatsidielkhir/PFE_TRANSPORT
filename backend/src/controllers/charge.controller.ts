import { RequestHandler } from 'express';
import Charge from '../models/charge.model';

// GET all charges
export const getCharges: RequestHandler = async (_req, res) => {
  try {
    const charges = await Charge.find()
      .populate('chauffeur', 'nom prenom')
      .sort({ date: -1 });

    res.json(charges);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// POST create new charge
export const addCharge: RequestHandler = async (req, res) => {
  try {
    const charge = new Charge(req.body);
    await charge.save();
    res.status(201).json(charge);
  } catch (err) {
    res.status(400).json({ message: 'Erreur création', error: err });
  }
};

// PUT update existing charge
export const updateCharge: RequestHandler = async (req, res) => {
  try {
    const updated = await Charge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Erreur modification', error: err });
  }
};

// DELETE remove charge
export const deleteCharge: RequestHandler = async (req, res) => {
  try {
    await Charge.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Charge supprimée' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err });
  }
};
