import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique';
import path from 'path';
import fs from 'fs';

export const getDossier = async (_: Request, res: Response) => {
  try {
    const raw = await DossierJuridique.findOne().lean();

    if (!raw) return res.json({});

    const { _id, __v, createdAt, updatedAt, ...docs } = raw;

    // Filtrer uniquement les documents valides (non vides)
    const cleaned = Object.fromEntries(
      Object.entries(docs).filter(([_, value]) => typeof value === 'string' && value.length > 0)
    );

    res.json(cleaned);
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier juridique:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const uploadDossier = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const dataToSave: Record<string, string> = {};

    Object.entries(files).forEach(([fieldname, fileArray]) => {
      if (fileArray && fileArray.length > 0) {
        dataToSave[fieldname] = fileArray[0].filename;
      }
    });

    let dossier = await DossierJuridique.findOne();

    if (dossier) {
      await DossierJuridique.updateOne({}, { $set: dataToSave });
    } else {
      dossier = new DossierJuridique(dataToSave);
      await dossier.save();
    }

    res.status(201).json({ message: 'Documents enregistrés avec succès ✅', data: dataToSave });
  } catch (error) {
    console.error('Erreur upload dossier juridique:', error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement des documents", error });
  }
};


