import { Request, Response } from 'express';
import Partenaire from '../models/partenaire.model';

export const getAllPartenaires = async (_: Request, res: Response) => {
  try {
    const partenaires = await Partenaire.find().sort({ createdAt: -1 });
    res.json(partenaires);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

import path from 'path'; // Pour générer le chemin de stockage du fichier

export const createPartenaire = async (req: Request, res: Response) => {
  try {
    const { nom, ice, adresse } = req.body;

    // Vérification du fichier téléchargé
    if (req.file) {
      console.log('Fichier reçu:', req.file); // Log du fichier reçu (nom, type, etc.)
      
      // Générer le chemin du fichier stocké (en local)
      const filePath = path.join(__dirname, '..', 'uploads', 'partenaires', req.file.filename);
      console.log('Fichier stocké à:', filePath); // Log du chemin où le fichier est stocké
      
      // Si vous utilisez un stockage local, cela peut être l'URL que vous utilisez pour servir le fichier
      const logoUrl = `uploads/partenaires/${req.file.filename}`;
      console.log('URL du fichier:', logoUrl); // Log de l'URL du fichier
    } else {
      console.log('Aucun fichier reçu'); // Log si aucun fichier n'est reçu
    }

    // Création d'un nouveau partenaire avec le nom, l'ICE, l'adresse et le logo
    const logo = req.file ? req.file.filename : ''; // Assurez-vous que 'logo' est bien défini
    const newPartenaire = new Partenaire({ nom, ice, adresse, logo });

    // Sauvegarder le partenaire dans la base de données
    await newPartenaire.save();

    // Réponse avec les informations du nouveau partenaire
    res.status(201).json(newPartenaire);
  } catch (err) {
    // En cas d'erreur
    console.error('Erreur lors de la création:', err);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const deletePartenaire = async (req: Request, res: Response) => {
  try {
    await Partenaire.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partenaire supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la suppression' });
  }
};

export const updatePartenaire = async (req: Request, res: Response) => {
  try {
    const { nom, ice, adresse } = req.body;
    const logo = req.file ? req.file.filename : undefined;

    const updateData: any = { nom, ice, adresse };
    if (logo) updateData.logo = logo;

    const partenaire = await Partenaire.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(partenaire);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du partenaire' });
  }
};
