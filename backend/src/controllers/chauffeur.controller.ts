import { RequestHandler } from 'express';
import Chauffeur from '../models/Chauffeur';

// ✅ Récupérer la liste des chauffeurs
export const getChauffeurs: RequestHandler = async (_req, res) => {
  try {
    const list = await Chauffeur.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Supprimer un chauffeur
export const deleteChauffeur: RequestHandler = async (req, res) => {
  try {
    await Chauffeur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chauffeur supprimé avec succès.' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression du chauffeur.' });
  }
};

// ✅ Modifier un chauffeur
export const updateChauffeur: RequestHandler = async (req, res) => {
  try {
    const updates: any = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files) {
      if (files['scanPermis']) updates.scanPermis = files['scanPermis'][0].filename;
      if (files['scanVisa']) updates.scanVisa = files['scanVisa'][0].filename;
      if (files['scanCIN']) updates.scanCIN = files['scanCIN'][0].filename;
      if (files['photo']) updates.photo = files['photo'][0].filename;
      if (files['certificatBonneConduite']) updates.certificatBonneConduite = files['certificatBonneConduite'][0].filename;
    }

    if ('visa_actif' in updates) {
      updates['visa.actif'] = updates.visa_actif === 'true' || updates.visa_actif === true;
      delete updates.visa_actif;
    }

    if (updates.permis_date_expiration) updates['permis.date_expiration'] = updates.permis_date_expiration;
    if (updates.contrat_type) updates['contrat.type'] = updates.contrat_type;
    if (updates.contrat_date_expiration) updates['contrat.date_expiration'] = updates.contrat_date_expiration;
    if (updates.visa_date_expiration) updates['visa.date_expiration'] = updates.visa_date_expiration;

    // ✅ Traitement des customDocs AVANT update
    const customDocs: { name: string; file: string }[] = [];

    Object.entries(req.body).forEach(([key, value]) => {
      const match = key.match(/^customDocs\[(\d+)\]\[name\]$/);
      if (match) {
        const index = match[1];
        const name = value as string;
        const fileField = `customDocs[${index}][file]`;
        if (files && fileField in files) {
          const file = files[fileField][0].filename;
          customDocs.push({ name, file });
        }
      }
    });

    if (customDocs.length > 0) {
      updates.customDocs = customDocs;
    }

    await Chauffeur.findByIdAndUpdate(req.params.id, updates, { new: true });

    res.json({ message: 'Chauffeur modifié avec succès.' });
  } catch (err) {
    console.error('❌ Erreur modification chauffeur :', err);
    res.status(500).json({ message: 'Erreur lors de la modification.' });
  }
};


// ✅ Ajouter un chauffeur
export const addChauffeur: RequestHandler = async (req, res) => {
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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const scanPermis = files && files['scanPermis'] ? files['scanPermis'][0].filename : '';
    const scanVisa = files && files['scanVisa'] ? files['scanVisa'][0].filename : '';
    const scanCIN = files && files['scanCIN'] ? files['scanCIN'][0].filename : '';
    const photo = files && files['photo'] ? files['photo'][0].filename : '';
    const certificatBonneConduite = files && files['certificatBonneConduite']
      ? files['certificatBonneConduite'][0].filename
      : '';

    const visaActifBool = visa_actif === 'true' || visa_actif === true;

    // ✅ Traitement des customDocs
    const customDocs: { name: string; file: string }[] = [];

    Object.entries(req.body).forEach(([key, value]) => {
      const match = key.match(/^customDocs\[(\d+)\]\[name\]$/);
      if (match) {
        const index = match[1];
        const name = value as string;
        const fileField = `customDocs[${index}][file]`;
        if (files && fileField in files) {
          const file = files[fileField][0].filename;
          customDocs.push({ name, file });
        }
      }
    });

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
      certificatBonneConduite,
      customDocs // ✅ ajout ici
    });

    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (err: any) {
    console.error('❌ Erreur lors de la création du chauffeur :', err);
    if (err.code === 11000) {
      res.status(400).json({ message: "Un chauffeur avec ce CIN existe déjà." });
    } else {
      res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
  }
};

