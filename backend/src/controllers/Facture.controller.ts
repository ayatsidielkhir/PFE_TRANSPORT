import { Request, Response } from 'express';
import Facture from '../models/facture';
import Partenaire from '../models/partenaire.model';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';




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

    // Validation minimale
    if (!date || !partenaire || !lignes || lignes.length === 0) {
      return res.status(400).json({ message: 'Champs obligatoires manquants.' });
    }

    // Récupérer partenaire
    const client = await Partenaire.findById(partenaire);
    if (!client) return res.status(404).json({ message: 'Client introuvable' });

    // Numérotation automatique
    const mois = date.slice(0, 7); // ex: "2025-05"
    const count = await Facture.countDocuments({ mois });
    const numero = `${(count + 1).toString().padStart(3, '0')}/${new Date().getFullYear()}`;


    console.log('📦 Données reçues :', {
  date, partenaire, ice, tracteur, lignes, tva, totalHT, totalTTC
});


    // Préparation du rendu
    const templatePath = path.join(__dirname, '..', 'templates', 'facture.ejs');
    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

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

    // Génération PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const filename = `facture_${numero.replace('/', '-')}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'uploads', 'factures', filename);
    await page.pdf({ path: filePath, format: 'A4' });
    await browser.close();

    const fileUrl = `/uploads/factures/${filename}`;

    // Enregistrement BDD
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

  } catch (error) {
    console.error('Erreur génération facture :', error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


export const getAllFactures = async (req: Request, res: Response) => {
    try {
    const factures = await Facture.find().populate('partenaire', 'nom').sort({ createdAt: -1 });
    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

export const getLatestFacture = async (req: Request, res: Response) => {
  try {
    const last = await Facture.findOne().sort({ createdAt: -1 });
    if (!last) return res.status(404).json({ message: 'Aucune facture trouvée.' });
    res.json(last);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

