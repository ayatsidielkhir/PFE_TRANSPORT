import { RequestHandler } from 'express';
import Facture from '../models/facture';
import Partenaire from '../models/partenaire.model';
import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs/promises';

export const generateManualFacture: RequestHandler = async (req, res) => {
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
      res.status(400).json({ message: 'Champs obligatoires manquants.' });
      return;
    }

    const client = await Partenaire.findById(partenaire);
    if (!client) {
      res.status(404).json({ message: 'Client introuvable' });
      return;
    }

    const mois = date.slice(0, 7);
    const count = await Facture.countDocuments({ mois });
    const numero = `${(count + 1).toString().padStart(3, '0')}/${new Date().getFullYear()}`;

    const templatePath = path.join(__dirname, '..', 'templates', 'facture.ejs');
    const logoPath = path.resolve(__dirname, '../../', 'assets', 'logo.png');

    try {
      await fs.access(templatePath);
    } catch {
      res.status(500).json({ message: `Template facture.ejs introuvable à ${templatePath}` });
      return;
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
    res.status(201).json({ message: 'Facture générée', fileUrl });
  } catch (error: any) {
    console.error('❌ Erreur génération facture :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message,
      stack: error.stack
    });
  }
};

export const getAllFactures: RequestHandler = async (_req, res) => {
  try {
    const factures = await Facture.find().populate('partenaire', 'nom').sort({ createdAt: -1 });
    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const getLatestFacture: RequestHandler = async (_req, res) => {
  try {
    const last = await Facture.findOne().sort({ createdAt: -1 });
    if (!last) {
      res.status(404).json({ message: 'Aucune facture trouvée.' });
      return;
    }
    res.json(last);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const deleteFacture: RequestHandler = async (req, res) => {
  try {
    const deleted = await Facture.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Facture introuvable' });
      return;
    }
    res.status(200).json({ message: 'Facture supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const getFactureById: RequestHandler = async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id).populate('partenaire', 'nom');
    if (!facture) {
      res.status(404).json({ message: 'Facture non trouvée' });
      return;
    }
    res.json(facture);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const updateStatutFacture: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const facture = await Facture.findById(id);
    if (!facture) {
      res.status(404).json({ message: 'Facture introuvable' });
      return;
    }

    facture.statut = facture.statut === 'payée' ? 'impayée' : 'payée';
    await facture.save();

    res.json({ message: 'Statut mis à jour', statut: facture.statut });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const updateFacture: RequestHandler = async (req, res) => {
  try {
    const updated = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Facture introuvable' });
      return;
    }
    res.json({ message: 'Facture mise à jour', facture: updated });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};
