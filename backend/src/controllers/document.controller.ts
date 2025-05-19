import { Request, Response } from 'express';
import Document from '../models/document.models';
import Chauffeur from '../models/Chauffeur'; 
import '../models/Vehicule';
import fs from 'fs';
import path from 'path';

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    console.log('Tentative de récupération des documents...');
    const documents = await Document.find().populate({
      path: 'linkedTo',
      model: Chauffeur, 
      strictPopulate: false
    });
    console.log('Documents récupérés:', documents);

    res.status(200).json(documents);
  } catch (error) {
    console.error('Erreur dans getAllDocuments:', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { type, expirationDate, entityType, linkedTo } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'Aucun fichier envoyé' });
      return;
    }

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
      res.status(404).json({ message: 'Document non trouvé' });
      return;
    }

    res.status(200).json(updatedDoc);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', err });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      res.status(404).json({ message: 'Document non trouvé' });
      return;
    }

    const filePath = path.resolve(doc.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(id);
    res.status(200).json({ message: 'Document supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression', err });
  }
};
