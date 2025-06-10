import { Request, Response } from 'express';
import Vehicule from '../models/Vehicule';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { RequestHandler } from 'express';

export const getVehicules = async (_req: Request, res: Response) => {
  try {
    const vehicules = await Vehicule.find().sort({ createdAt: -1 });
    res.status(200).json(vehicules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const addVehicule: RequestHandler = async (req, res)=> {
  try {
    const {
      nom,
      matricule,
      type,
      kilometrage,
      controle_technique,
      chauffeur
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const vehicule = new Vehicule({
      nom,
      matricule,
      type,
      kilometrage: Number(kilometrage),
      controle_technique,
      chauffeur,
      carteGrise: files?.carteGrise?.[0]?.filename || '',
      assurance: files?.assurance?.[0]?.filename || '',
      vignette: files?.vignette?.[0]?.filename || '',
      agrement: files?.agrement?.[0]?.filename || '',
      carteVerte: files?.carteVerte?.[0]?.filename || '',
      extincteur: files?.extincteur?.[0]?.filename || '',
      photoVehicule: files?.photoVehicule?.[0]?.filename || '',
    });

    await vehicule.save();
    res.status(201).json(vehicule);
  } catch (err) {
    console.error('❌ Erreur création véhicule :', err);
    res.status(400).json({ message: 'Erreur création', error: err });
  }
};

export const updateVehicule: RequestHandler = async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updates: any = {
      ...req.body,
      kilometrage: Number(req.body.kilometrage),
    };

    const fileFields = ['carteGrise', 'assurance', 'vignette', 'agrement', 'carteVerte', 'extincteur', 'photoVehicule'];

    const vehicule = await Vehicule.findById(req.params.id);
    if (!vehicule) {
      res.status(404).json({ message: 'Véhicule introuvable' });
      return;
    }

    fileFields.forEach((field) => {
      if (files?.[field]?.[0]) {
        const oldFile = (vehicule as any)[field];
        if (oldFile) {
          const filePath = path.join('/mnt/data/uploads/vehicules', oldFile);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        updates[field] = files[field][0].filename;
      }
    });

    const updated = await Vehicule.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Erreur modification véhicule :', err);
    res.status(400).json({ message: 'Erreur modification', error: err });
  }
};



export const deleteVehicule = async (req: Request, res: Response) => {
  try {
    await Vehicule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Véhicule supprimé' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur suppression', error: err });
  }
};

export const downloadVehiculeDocs = async (req: Request, res: Response) => {
  try {
    const vehiculeId = req.params.id;
    const vehicule = await Vehicule.findById(vehiculeId);
    if (!vehicule) return res.status(404).json({ message: 'Véhicule non trouvé' });

    const uploadDir = '/mnt/data/uploads/vehicules';
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(`${vehicule.nom || 'vehicule'}-documents.zip`);
    archive.pipe(res);

    const docs = [
      'carteGrise',
      'assurance',
      'vignette',
      'agrement',
      'carteVerte',
      'extincteur',
      'photoVehicule'
    ];

    docs.forEach((doc) => {
      const filename = (vehicule as any)[doc];
      if (filename) {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: filename });
        }
      }
    });

    await archive.finalize();
  } catch (err) {
    console.error('❌ Erreur ZIP :', err);
    res.status(500).json({ message: 'Erreur lors du téléchargement', error: err });
  }
};
