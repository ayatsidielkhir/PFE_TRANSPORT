import { RequestHandler } from 'express';
import Charge from '../models/charge.model';

// ✅ GET all charges
export const getCharges: RequestHandler = async (_req, res) => {
  try {
    const charges = await Charge.find()
      .populate({ path: 'chauffeur', select: 'nom prenom', strictPopulate: false }) // Sécurisé
      .sort({ date: -1 });

    res.json(charges);
  } catch (err: any) {
    console.error('❌ Erreur getCharges:', err.message, err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// ✅ POST create new charge
export const addCharge: RequestHandler = async (req, res) => {
  try {
    const { type, montant, date, statut, chauffeur, autreType } = req.body;

    // Si type = "Autre", on remplace par "autreType"
    const finalType = type === 'Autre' ? autreType?.trim() || 'Autre' : type;

    const newCharge = new Charge({
      type: finalType,
      montant,
      date,
      statut,
      chauffeur: chauffeur || undefined
    });

    await newCharge.save();
    res.status(201).json(newCharge);
  } catch (err) {
    console.error('Erreur création charge:', err);
    res.status(400).json({ message: 'Erreur création', error: err });
  }
};

// ✅ PUT update existing charge
export const updateCharge: RequestHandler = async (req, res) => {
  try {
    const updated = await Charge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur modification charge:', err);
    res.status(400).json({ message: 'Erreur modification', error: err });
  }
};

// ✅ DELETE remove charge
export const deleteCharge: RequestHandler = async (req, res) => {
  try {
    await Charge.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Charge supprimée' });
  } catch (err) {
    console.error('Erreur suppression charge:', err);
    res.status(400).json({ message: 'Erreur suppression', error: err });
  }
};
