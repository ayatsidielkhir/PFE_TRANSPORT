import { RequestHandler } from 'express';
import Caisse from '../models/caisse.model';
import Charge from '../models/charge.model';

// ✅ GET toutes les opérations
export const getOperations: RequestHandler = async (_req, res) => {
  try {
    const operations = await Caisse.find().sort({ date: -1 });
    res.json(operations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ POST - Ajouter opération + synchroniser avec Charge si Sortie
export const addOperation: RequestHandler = async (req, res) => {
  try {
    const { type, montant, date, nom, sujet, modePaiement, statut } = req.body;
    const justificatif = req.file?.filename;
    const montantFloat = parseFloat(montant);
    const parsedDate = new Date(date);

    const newOp = await Caisse.create({
      type,
      montant: montantFloat,
      date: parsedDate,
      nom,
      sujet,
      modePaiement,
      statut,
      justificatif,
    });

    if (type === 'Sortie') {
      await Charge.create({
        type: 'Sortie Caisse',
        description: sujet || 'Sortie caisse',
        montant: montantFloat,
        date: parsedDate,
        statut,
        notes: `Ajout automatique depuis la caisse pour ${nom}`,
        lienCaisse: newOp._id,
      });
    }

    res.status(201).json(newOp);
  } catch (err: any) {
    console.error('❌ Erreur addOperation:', err.message, err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ PUT - Modifier opération + MAJ dans Charge si Sortie
export const updateOperation: RequestHandler = async (req, res) => {
  try {
    const { type, montant, date, nom, sujet, modePaiement, statut } = req.body;
    const justificatif = req.file?.filename;
    const montantFloat = parseFloat(montant);
    const parsedDate = new Date(date);

    const updated = await Caisse.findByIdAndUpdate(
      req.params.id,
      {
        type,
        montant: montantFloat,
        date: parsedDate,
        nom,
        sujet,
        modePaiement,
        statut,
        ...(justificatif && { justificatif }),
      },
      { new: true }
    );

    if (type === 'Sortie') {
      await Charge.findOneAndUpdate(
        { lienCaisse: req.params.id },
        {
          type: 'Sortie Caisse',
          description: sujet || 'Sortie caisse',
          montant: montantFloat,
          date: parsedDate,
          statut,
          notes: `Mise à jour depuis la caisse pour ${nom}`,
        }
      );
    }

    res.status(200).json(updated);
  } catch (err: any) {
    console.error('❌ Erreur updateOperation:', err.message, err.stack);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ DELETE - Supprimer opération + supprimer Charge liée
export const deleteOperation: RequestHandler = async (req, res) => {
  try {
    await Caisse.findByIdAndDelete(req.params.id);
    await Charge.deleteOne({ lienCaisse: req.params.id });
    res.status(200).json({ message: 'Opération supprimée' });
  } catch (err) {
    console.error('❌ Erreur deleteOperation:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};