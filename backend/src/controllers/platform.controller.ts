import { Request, Response } from 'express';
import Platform from '../models/Platform';

export const getPlatforms = async (_: Request, res: Response) => {
  const list = await Platform.find();
  res.json(list);
};

export const addPlatform = async (req: Request, res: Response) => {
  const { nom, email, password, lien } = req.body;
  const logo = req.file?.filename;
  const created = await Platform.create({ nom, email, password, lien, logo });
  res.status(201).json(created);
};

export const deletePlatform = async (req: Request, res: Response) => {
  await Platform.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
};

export const updatePlatform = async (req: Request, res: Response) => {
  const { nom, email, password, lien } = req.body;
  const updatedData: any = { nom, email, password, lien };
  if (req.file) updatedData.logo = req.file.filename;
  const updated = await Platform.findByIdAndUpdate(req.params.id, updatedData, { new: true });
  res.json(updated);
};
