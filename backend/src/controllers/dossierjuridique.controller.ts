import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import DossierJuridique from '../models/DossierJuridique';
import { RequestHandler } from 'express';

export const getDossier: RequestHandler = async (_req, res) => {
  try {
    const doc = await DossierJuridique.findOne().lean();

    if (!doc) {
      res.json({});
      return;
    }

    const { _id, __v, createdAt, updatedAt, ...cleaned } = doc;
    res.json(cleaned);
    return; // ✅ évite l'erreur de typage
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
    return; // ✅ important ici aussi
  }
};


export const uploadDossier = async (req: Request, res: Response) => {
  const uploaded = req.files;
  const updateData: Record<string, string> = {};

  if (Array.isArray(uploaded)) {
    for (const file of uploaded) {
      updateData[file.fieldname] = file.filename;
    }
  } else {
    res.status(400).json({ message: 'Fichiers non valides' });
    return;
  }

  const existing = await DossierJuridique.findOne();
  if (existing) {
    await DossierJuridique.updateOne({}, { $set: updateData });
  } else {
    await DossierJuridique.create(updateData);
  }

  res.status(201).json({ message: 'Documents enregistrés' });
};

export const deleteFileFromDossier = async (req: Request, res: Response) => {
  const { field } = req.params;
  const dossier = await DossierJuridique.findOne();

  if (!dossier || !(dossier as any)[field]) {
    res.status(404).json({ message: 'Document non trouvé' });
    return;
  }

  const filename = (dossier as any)[field];
  const filePath = path.resolve('/mnt/data/uploads/juridique', filename);

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await DossierJuridique.updateOne({}, { $unset: { [field]: '' } });
  res.json({ message: 'Document supprimé' });
};
