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



export const uploadDossier: RequestHandler = async (req, res) => {
  const uploaded = req.files;
  const newKey = req.body.key;
  const oldKey = req.body.oldKey;

  if (!uploaded || !Array.isArray(uploaded) || uploaded.length === 0) {
    res.status(400).json({ message: 'Aucun fichier reçu' });
    return;
  }

  if (!newKey) {
    res.status(400).json({ message: 'Clé de document manquante (key)' });
    return;
  }

  const file = uploaded[0];
  const filename = file.filename;

  const updateData = { [newKey]: filename };

  const existing = await DossierJuridique.findOne();

  if (existing) {
    // 🧽 Supprimer ancien champ si différent
    if (oldKey && oldKey !== newKey && (existing as any)[oldKey]) {
      const oldFileName = (existing as any)[oldKey];
      const filePath = path.resolve('/mnt/data/uploads/juridique', oldFileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await DossierJuridique.updateOne({}, {
        $unset: { [oldKey]: '' },
        $set: updateData
      });
    } else {
      await DossierJuridique.updateOne({}, { $set: updateData });
    }
  } else {
    await DossierJuridique.create(updateData);
  }

  res.status(201).json({ message: 'Document mis à jour' });
};



export const deleteFileFromDossier: RequestHandler = async (req, res) => {
  try {
    const { field } = req.params;

    if (!field) {
      res.status(400).json({ message: 'Champ non fourni' });
      return;
    }

    const dossier = await DossierJuridique.findOne();
    if (!dossier || !(dossier as any)[field]) {
      res.status(404).json({ message: 'Document non trouvé' });
      return;
    }

    const rawFilename = (dossier as any)[field];
    const filename = typeof rawFilename === 'string' ? rawFilename : String(rawFilename);
    const filePath = path.resolve('/mnt/data/uploads/juridique', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await DossierJuridique.updateOne({}, { $unset: { [field]: '' } });

    res.json({ message: 'Document supprimé' }); // ✅ PAS DE return ici
  } catch (err) {
    console.error('❌ Erreur suppression fichier:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' }); // ✅ PAS DE return ici
  }
};

export const renameDossierField: RequestHandler = async (req, res) => {
  try {
    const { oldKey, newKey } = req.body;

    if (!oldKey || !newKey || oldKey === newKey) {
      res.status(400).json({ message: 'Clés invalides' });
      return;
    }

    const doc = await DossierJuridique.findOne();
    if (!doc || !(doc as any)[oldKey]) {
      res.status(404).json({ message: 'Champ à renommer non trouvé' });
      return;
    }

    const value = (doc as any)[oldKey];

    await DossierJuridique.updateOne({}, {
      $unset: { [oldKey]: '' },
      $set: { [newKey]: value }
    });

    res.json({ message: 'Champ renommé avec succès' }); // ✅ pas de return ici
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du renommage', error }); // ✅ pas de return ici
  }
};


