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
    const filesArray = req.files as unknown as Express.Multer.File[];
    const fileMap = Object.fromEntries(filesArray.map(file => [file.fieldname, file]));

    if (fileMap['scanPermis']) updates.scanPermis = fileMap['scanPermis'].filename;
    if (fileMap['scanVisa']) updates.scanVisa = fileMap['scanVisa'].filename;
    if (fileMap['scanCIN']) updates.scanCIN = fileMap['scanCIN'].filename;
    if (fileMap['photo']) updates.photo = fileMap['photo'].filename;
    if (fileMap['certificatBonneConduite']) updates.certificatBonneConduite = fileMap['certificatBonneConduite'].filename;

    if ('visa_actif' in updates) {
      updates['visa.actif'] = updates.visa_actif === 'true' || updates.visa_actif === true;
      delete updates.visa_actif;
    }

    if (updates.permis_date_expiration) updates['permis.date_expiration'] = updates.permis_date_expiration;
    if (updates.contrat_type) updates['contrat.type'] = updates.contrat_type;
    if (updates.contrat_date_expiration) updates['contrat.date_expiration'] = updates.contrat_date_expiration;
    if (updates.visa_date_expiration) updates['visa.date_expiration'] = updates.visa_date_expiration;

    const customDocs: { name: string; file: string }[] = [];
    Object.entries(req.body).forEach(([key, value]) => {
      const match = key.match(/^customDocs\[(\d+)\]\[name\]$/);
      if (match) {
        const index = match[1];
        const name = value as string;
        const fileField = `customDocs[${index}][file]`;
        const matchedFile = filesArray.find(f => f.fieldname === fileField);
        if (matchedFile) {
          customDocs.push({ name, file: matchedFile.filename });
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
      nom, prenom, telephone, cin, adresse,
      observations, permis_date_expiration,
      contrat_type, contrat_date_expiration,
      visa_actif, visa_date_expiration
    } = req.body;

    const filesArray = req.files as unknown as Express.Multer.File[];
    const fileMap = Object.fromEntries(filesArray.map(file => [file.fieldname, file]));

    const scanPermis = fileMap['scanPermis']?.filename || '';
    const scanVisa = fileMap['scanVisa']?.filename || '';
    const scanCIN = fileMap['scanCIN']?.filename || '';
    const photo = fileMap['photo']?.filename || '';
    const certificatBonneConduite = fileMap['certificatBonneConduite']?.filename || '';
    const visaActifBool = visa_actif === 'true' || visa_actif === true;

    // ✅ Traiter les fichiers customDocs dynamiques
    const customDocs: { name: string; file: string }[] = [];
    Object.entries(req.body).forEach(([key, value]) => {
      const match = key.match(/^customDocs\[(\d+)\]\[name\]$/);
      if (match) {
        const index = match[1];
        const name = value as string;
        const fileField = `customDocs[${index}][file]`;
        const matchedFile = filesArray.find(f => f.fieldname === fileField);
        if (matchedFile) {
          customDocs.push({ name, file: matchedFile.filename });
        }
      }
    });

    const chauffeur = new Chauffeur({
      nom, prenom, telephone, cin, adresse, observations,
      permis: { date_expiration: permis_date_expiration },
      contrat: { type: contrat_type, date_expiration: contrat_date_expiration },
      visa: { actif: visaActifBool, date_expiration: visa_date_expiration },
      scanPermis, scanVisa, scanCIN, photo, certificatBonneConduite,
      customDocs
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


