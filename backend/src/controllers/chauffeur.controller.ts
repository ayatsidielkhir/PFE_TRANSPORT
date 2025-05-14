import { Request, Response } from 'express';
import Chauffeur from '../models/Chauffeur';

export const getChauffeurs = async (_: Request, res: Response) => {
  try {
    const list = await Chauffeur.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};



export const addChauffeur = async (req: Request, res: Response) => {
  try {
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      nom,
      prenom,
      telephone,
      cin,
      adresse,
      observations,
      permis_type,
      permis_date_expiration,
      contrat_type,
      contrat_date_expiration,
      visa_actif,
      visa_date_expiration
    } = req.body;

    const scanPermis =
      req.files && 'scanPermis' in req.files ? (req.files['scanPermis'] as Express.Multer.File[])[0].filename : '';
    const scanVisa =
      req.files && 'scanVisa' in req.files ? (req.files['scanVisa'] as Express.Multer.File[])[0].filename : '';
    const scanCIN =
      req.files && 'scanCIN' in req.files ? (req.files['scanCIN'] as Express.Multer.File[])[0].filename : '';

    const chauffeur = new Chauffeur({
      nom,
      prenom,
      telephone,
      cin,
      adresse,
      observations,
      permis: {
        type: permis_type,
        date_expiration: permis_date_expiration
      },
      contrat: {
        type: contrat_type,
        date_expiration: contrat_date_expiration
      },
      visa: {
        actif: visa_actif === 'true',
        date_expiration: visa_date_expiration || null
      },
      scanPermis,
      scanVisa,
      scanCIN
    });

    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (err: any) {
    console.error('🔥 ERREUR interne:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


export const deleteChauffeur = async (req: Request, res: Response) => {
  try {
    await Chauffeur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chauffeur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err });
  }
};
