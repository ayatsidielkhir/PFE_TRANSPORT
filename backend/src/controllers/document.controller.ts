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

// ✅ Ajout de la mise à jour d'un document
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, expirationDate, entityType, linkedTo } = req.body;

    const updatedFields: any = {
      type,
      expirationDate,
      entityType,
      linkedTo,
    };

    if (req.file) {
      updatedFields.fileName = req.file.filename;
      updatedFields.filePath = req.file.path;
    }

    const updatedDoc = await Document.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    res.status(200).json(updatedDoc);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', err });
  }
};
