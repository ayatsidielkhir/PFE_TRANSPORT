import { Request, Response } from 'express';
import DossierJuridique from '../models/DossierJuridique';

export const getDossier = async (_: Request, res: Response) => {
  const data = await DossierJuridique.findOne();
  res.json(data);
};

export const uploadDossier = async (req: Request, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  let dossier = await DossierJuridique.findOne();
  if (!dossier) dossier = new DossierJuridique();

  dossier.modelJ = files['modelJ']?.[0]?.filename || dossier.modelJ;
  dossier.statut = files['statut']?.[0]?.filename || dossier.statut;
  dossier.rc = files['rc']?.[0]?.filename || dossier.rc;
  dossier.identifiantFiscale = files['identifiantFiscale']?.[0]?.filename || dossier.identifiantFiscale;
  dossier.cinGerant = files['cinGerant']?.[0]?.filename || dossier.cinGerant;
  dossier.doc1007 = files['doc1007']?.[0]?.filename || dossier.doc1007;

  await dossier.save();
  res.status(201).json(dossier);
};
