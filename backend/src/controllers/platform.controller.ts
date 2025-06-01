import { Request, Response } from 'express';
import Platform from '../models/Platform';

export const getPlatforms = async (_: Request, res: Response) => {
  try {
    const list = await Platform.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des plateformes", error: err });
  }
};

export const addPlatform = async (req: Request, res: Response) => {
  try {
    const { nom, email, password, lien } = req.body;
    const logo = req.file?.filename;

    const created = await Platform.create({ nom, email, password, lien, logo });
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la création de la plateforme", error: err });
  }
};

export const updatePlatform = async (req: Request, res: Response) => {
  try {
    const { nom, email, password, lien } = req.body;

    const updatedData: any = { nom, email, password, lien };
    if (req.file?.filename) {
      updatedData.logo = req.file.filename;
    }

    const updated = await Platform.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la mise à jour de la plateforme", error: err });
  }
};

export const deletePlatform = async (req: Request, res: Response) => {
  try {
    await Platform.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ message: "Erreur lors de la suppression", error: err });
  }
};
