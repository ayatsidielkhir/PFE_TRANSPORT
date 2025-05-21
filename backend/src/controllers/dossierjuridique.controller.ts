import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique';

export const getDossier = async (_: Request, res: Response) => {
  const data = await DossierJuridique.findOne();
  res.json(data);
};

export const uploadDossier = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const data = {
    modelJ: files['modelJ']?.[0]?.filename,
    statut: files['statut']?.[0]?.filename,
    rc: files['rc']?.[0]?.filename,
    identifiantFiscale: files['identifiantFiscale']?.[0]?.filename,
    cinGerant: files['cinGerant']?.[0]?.filename,
    doc1007: files['doc1007']?.[0]?.filename,
  };

  await DossierJuridique.deleteMany(); // garder un seul
  const saved = await DossierJuridique.create(data);
  res.status(201).json(saved);
};
