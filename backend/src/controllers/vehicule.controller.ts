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
      chauffeur
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const carteGrise = files?.carteGrise?.[0]?.filename || '';
    const assurance = files?.assurance?.[0]?.filename || '';

    const vehicule = new Vehicule({
      nom,
      matricule,
      type,
      kilometrage: Number(kilometrage),
      controle_technique,
      assurance,
      carteGrise,
      chauffeur
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
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const updates = {
      ...req.body,
      kilometrage: Number(req.body.kilometrage),
    };

    if (files?.carteGrise?.[0]) {
      updates['carteGrise'] = files.carteGrise[0].filename;
    }

    if (files?.assurance?.[0]) {
      updates['assurance'] = files.assurance[0].filename;
    }

    const updated = await Vehicule.findByIdAndUpdate(
      req.params.id,
      updates,
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
