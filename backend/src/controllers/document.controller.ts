import { Request, Response } from 'express';
import Document from '../models/document.models';

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { type, expirationDate, entityType, linkedTo } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Aucun fichier envoyé' });

    const newDoc = new Document({
      type,
      fileName: file.filename,
      filePath: file.path,
      expirationDate,
      entityType,
      linkedTo
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'upload', err });
  }
};
