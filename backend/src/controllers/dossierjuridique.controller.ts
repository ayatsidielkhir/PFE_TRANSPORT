// dossierjuridique.controller.ts

import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique'; // Assurez-vous d'avoir ce modèle Mongoose

export const getDossier = async (_: Request, res: Response) => {
  const data = await DossierJuridique.findOne();
  res.json(data); // Retourne les données du dossier
};

export const uploadDossier = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const dataToSave: Record<string, string> = {}; // Structure pour stocker les fichiers téléchargés

    // Parcourir les fichiers reçus et les ajouter à `dataToSave`
    Object.entries(files).forEach(([fieldname, fileArray]) => {
      if (fileArray && fileArray.length > 0) {
        dataToSave[fieldname] = fileArray[0].filename;
      }
    });

    // Vérifier s'il y a déjà un dossier existant
    let dossier = await DossierJuridique.findOne();

    if (dossier) {
      await DossierJuridique.updateOne({}, { $set: dataToSave });
    } else {
      dossier = new DossierJuridique(dataToSave); // Créer un nouveau dossier si non trouvé
      await dossier.save();
    }

    res.status(201).json({ message: 'Documents enregistrés avec succès ✅', data: dataToSave });
  } catch (error) {
    console.error('Erreur upload dossier juridique:', error);
    res.status(500).json({ message: "Erreur lors de l'enregistrement des documents", error });
  }
};
