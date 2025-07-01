import { Request, Response } from 'express';
import path from 'path';
import Partenaire from '../models/partenaire.model'; 

export const getAllPartenaires = async (req: Request, res: Response) => {
  try {
    const partenaires = await Partenaire.find();
    res.status(200).json(partenaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

export const createPartenaire = async (req: Request, res: Response) => {
  try {
    const { nom, ice, adresse, email, telephone } = req.body;

    const files = req.files as { [key: string]: Express.Multer.File[] };
    const logo = files?.logo?.[0]?.filename || '';
    const contrat = files?.contrat?.[0]?.filename || '';

    const newPartenaire = new Partenaire({
      nom,
      ice,
      adresse,
      email,
      telephone,
      logo,
      contrat
    });

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
    const files = req.files as { [key: string]: Express.Multer.File[] };

    const updateData: any = {
      nom,
      ice,
      adresse,
      email,
      telephone
    };

    if (files?.logo?.[0]) updateData.logo = files.logo[0].filename;
    if (files?.contrat?.[0]) updateData.contrat = files.contrat[0].filename;

    const partenaire = await Partenaire.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(partenaire);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du partenaire' });
  }
};

