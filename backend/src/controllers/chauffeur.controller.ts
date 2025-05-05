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
    const {
      nom,
      prenom,
      telephone,
      cin,
      adresse,
      observations,
      'permis.type': permisType,
      'permis.date_expiration': permisDate,
      'contrat.type': contratType,
      'contrat.date_expiration': contratDate,
      'visa.actif': visaActif,
      'visa.date_expiration': visaDate
    } = req.body;

    const scanPermis =
      req.files && 'scanPermis' in req.files ? req.files['scanPermis'][0].filename : '';
    const scanVisa =
      req.files && 'scanVisa' in req.files ? req.files['scanVisa'][0].filename : '';
    const scanCIN =
      req.files && 'scanCIN' in req.files ? req.files['scanCIN'][0].filename : '';

    const chauffeur = new Chauffeur({
      nom,
      prenom,
      telephone,
      cin,
      adresse,
      observations,
      permis: {
        type: permisType,
        date_expiration: permisDate
      },
      contrat: {
        type: contratType,
        date_expiration: contratDate
      },
      visa: {
        actif: visaActif === 'true',
        date_expiration: visaDate || null
      },
      scanPermis,
      scanVisa,
      scanCIN
    });

    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err });
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
