 import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique';
import Dossier from '../models/DossierJuridique'; // Assure-toi d’avoir ce fichier mongoose


export const getDossier = async (_: Request, res: Response) => {
  const data = await DossierJuridique.findOne();
  res.json(data);
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

    const existing = await Dossier.findOne();

    if (existing) {
      await Dossier.updateOne({}, { $set: dataToSave });
    } else {
      await Dossier.create(dataToSave);
    }

    res.status(201).json({ message: 'Documents enregistrés avec succès ✅', data: dataToSave });
  } catch (error) {
    console.error('Erreur upload dossier juridique:', error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement des documents", error });
  }
};