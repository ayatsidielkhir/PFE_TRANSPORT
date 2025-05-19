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
export const deleteChauffeur = async (req: Request, res: Response) => {
  try {
    await Chauffeur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chauffeur supprimé avec succès.' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression du chauffeur.' });
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
      permis_date_expiration,
      contrat_type,
      contrat_date_expiration,
      visa_actif,
      visa_date_expiration
    } = req.body;

    const scanPermis = req.files && 'scanPermis' in req.files ? req.files['scanPermis'][0].filename : '';
    const scanVisa = req.files && 'scanVisa' in req.files ? req.files['scanVisa'][0].filename : '';
    const scanCIN = req.files && 'scanCIN' in req.files ? req.files['scanCIN'][0].filename : '';
    const photo = req.files && 'photo' in req.files ? req.files['photo'][0].filename : '';
    const certificatBonneConduite = req.files && 'certificatBonneConduite' in req.files ? req.files['certificatBonneConduite'][0].filename : '';
    const visaActifBool = visa_actif === 'true' || visa_actif === true;

    const chauffeur = new Chauffeur({
      nom,
      prenom,
      telephone,
      cin,
      adresse,
      observations,
      permis: {
        date_expiration: permis_date_expiration
      },
      contrat: {
        type: contrat_type,
        date_expiration: contrat_date_expiration
      },
      visa: {
        actif: visaActifBool,      
        date_expiration: visa_date_expiration
      },
      scanPermis,
      scanVisa,
      scanCIN,
      photo,
      certificatBonneConduite
    });

    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (err: any) {
    console.error('❌ Erreur lors de la création du chauffeur :', err);
  
    if (err instanceof Error && 'code' in err && (err as any).code === 11000) {
      return res.status(400).json({ message: "Un chauffeur avec ce CIN existe déjà." });
    }
  
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
  
  
  
};