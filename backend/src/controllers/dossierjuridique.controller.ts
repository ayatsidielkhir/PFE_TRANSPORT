import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';

export const getDossier: RequestHandler = async (_req, res) => {
  try {
    const data = await DossierJuridique.findOne();
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
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


