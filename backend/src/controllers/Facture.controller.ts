import { Request, Response } from 'express';
import Facture from '../models/facture';
import Partenaire from '../models/partenaire.model';
import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs/promises';

export const generateManualFacture = async (req: Request, res: Response) => {
  try {
    const {
      date,
      partenaire,
      ice,
      tracteur,
      lignes,
      tva,
      totalHT,
      totalTTC
    } = req.body;

    if (!date || !partenaire || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    const client = await Partenaire.findById(partenaire);
    if (!client) return res.status(404).json({ message: 'Client introuvable' });

    const mois = date.slice(0, 7); // ex: "2025-05"
    const count = await Facture.countDocuments({ mois });
    const numero = `${(count + 1).toString().padStart(3, '0')}/${new Date().getFullYear()}`;

    const templatePath = path.join(__dirname, '..', 'templates', 'facture.ejs');
    const logoPath = path.resolve(__dirname, '../../', 'assets', 'logo.png');

    try {
      await fs.access(templatePath);
    } catch {
      return res.status(500).json({ message: `Template facture.ejs introuvable à ${templatePath}` });
    }

    const html = await ejs.renderFile(templatePath, {
      numero,
      date,
      client,
      ice,
      tracteur,
      lignes,
      tva,
      totalHT,
      totalTTC,
      logoPath
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const filename = `facture_${numero.replace('/', '-')}_${Date.now()}.pdf`;
    const fileDir = path.resolve(__dirname, '../../uploads/factures');
    await fs.mkdir(fileDir, { recursive: true });
    const filePath = path.join(fileDir, filename);
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    const fileUrl = `/uploads/factures/${filename}`;

    const facture = new Facture({
      numero,
      date,
      mois,
      partenaire,
      ice,
      tracteur,
      lignes,
      tva,
      totalHT,
      totalTTC,
      fileUrl
    });

    await facture.save();

    return res.status(201).json({ message: 'Facture générée', fileUrl });

  } catch (error: any) {
    console.error('❌ Erreur génération facture :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message || error });
  }
};

export const getAllFactures = async (_: Request, res: Response) => {
  try {
    const factures = await Facture.find().populate('partenaire', 'nom').sort({ createdAt: -1 });
    return res.json(factures);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const getLatestFacture = async (_: Request, res: Response) => {
  try {
    const last = await Facture.findOne().sort({ createdAt: -1 });
    if (!last) return res.status(404).json({ message: 'Aucune facture trouvée.' });
    return res.json(last);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};
export const deleteFacture = async (req: Request, res: Response) => {
  try {
    const deleted = await Facture.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Facture introuvable' });
    res.status(200).json({ message: 'Facture supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};
export const updateFacture = async (req: Request, res: Response) => {
  try {
    const updated = await Facture.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Facture non trouvée' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};
export const getFactureById = async (req: Request, res: Response) => {
  try {
    const facture = await Facture.findById(req.params.id).populate('partenaire', 'nom');
    if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
    res.json(facture);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};
export const updateStatutFacture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const facture = await Facture.findById(id);
    if (!facture) return res.status(404).json({ message: 'Facture introuvable' });

    facture.statut = facture.statut === 'payée' ? 'impayée' : 'payée';
    await facture.save();

    res.json({ message: 'Statut mis à jour', statut: facture.statut });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};



