import { RequestHandler } from 'express';
import Vehicule from '../models/Vehicule';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// ✅ Créer un véhicule
export const addVehicule: RequestHandler = async (req, res) => {
  try {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const newVehicule = new Vehicule({
      nom: body.nom,
      matricule: body.matricule,
      type: body.type,
      kilometrage: body.kilometrage,
      controle_technique: body.controle_technique,
      chauffeur: body.chauffeur,
      carteGrise: files?.carteGrise?.[0]?.filename || '',
      assurance: files?.assurance?.[0]?.filename || '',
      vignette: files?.vignette?.[0]?.filename || '',
      agrement: files?.agrement?.[0]?.filename || '',
      carteVerte: files?.carteVerte?.[0]?.filename || '',
      extincteur: files?.extincteur?.[0]?.filename || '',
      photo: files?.photoVehicule?.[0]?.filename || '',
    });

    await newVehicule.save();
    res.status(201).json(newVehicule);
  } catch (err) {
    console.error('❌ Erreur ajout véhicule :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Récupérer tous les véhicules
export const getVehicules: RequestHandler = async (_req, res) => {
  try {
    const vehicules = await Vehicule.find();
    res.json(vehicules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Modifier un véhicule
export const updateVehicule: RequestHandler = async (req, res) => {
  try {
    const updates: any = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const fieldsToUpdate = [
      'carteGrise', 'assurance', 'vignette', 'agrement', 'carteVerte', 'extincteur', 'photoVehicule'
    ];

    fieldsToUpdate.forEach((field) => {
      if (files && files[field]) {
        updates[field === 'photoVehicule' ? 'photo' : field] = files[field][0].filename;
      }
    });

    const updated = await Vehicule.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Erreur update véhicule :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Supprimer un véhicule
export const deleteVehicule: RequestHandler = async (req, res) => {
  try {
    await Vehicule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Véhicule supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Télécharger les fichiers du véhicule en ZIP
export const downloadVehiculeDocs: RequestHandler = async (req, res) => {
  try {
    const { vehiculeId } = req.params;
    const { nom, ...docs } = req.query;

    const nomNettoye = (nom as string || vehiculeId).replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=vehicule-${nomNettoye}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('Erreur archive:', err);
      res.status(500).end();
    });

    archive.pipe(res);

    for (const [key, filename] of Object.entries(docs)) {
      const filepath = path.join('/mnt/data/uploads/vehicules', filename as string);
      if (fs.existsSync(filepath)) {
        const extension = path.extname(filename as string);
        const docName = `${key}${extension}`;
        archive.file(filepath, { name: docName });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('Erreur dans le téléchargement ZIP :', err);
    res.status(500).send('Erreur serveur lors de la création du zip');
  }
};
