import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import DossierJuridique from '../models/DossierJuridique';

export const getDossier = async (_req: Request, res: Response) => {
  const doc = await DossierJuridique.findOne().lean();
  if (!doc) {
    res.json({});
    return;
  }
  res.json(doc);
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
