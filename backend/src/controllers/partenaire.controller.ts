import { Request, Response } from 'express';
import Partenaire from '../models/partenaire.model';
import path from 'path'; // Pour générer le chemin de stockage du fichier


export const getAllPartenaires = async (_: Request, res: Response) => {
  try {
    const partenaires = await Partenaire.find().sort({ createdAt: -1 });
    res.json(partenaires);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


export const createPartenaire = async (req: Request, res: Response) => {
  try {
    const { nom, ice, adresse, email, telephone } = req.body;
    const logo = req.file ? req.file.filename : '';

    const newPartenaire = new Partenaire({ nom, ice, adresse, email, telephone, logo });
    await newPartenaire.save();

    res.status(201).json(newPartenaire);
  } catch (err) {
    console.error('Erreur lors de la création:', err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const deletePartenaire = async (req: Request, res: Response) => {
  try {
    await Partenaire.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partenaire supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
};

export const updatePartenaire = async (req: Request, res: Response) => {
  try {
    const { nom, ice, adresse, email, telephone } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    const updateData: any = { nom, ice, adresse, email, telephone };
    if (logo) updateData.logo = logo;

    const partenaire = await Partenaire.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(partenaire);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du partenaire' });
  }
};