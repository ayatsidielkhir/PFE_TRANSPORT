import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import ejs from 'ejs';
import Facture from '../models/facture';
import Trajet from '../models/trajet.model';

export const generateManualFacture = async (req: Request, res: Response): Promise<Response> => {
  try {
    let {
      numeroFacture,
      client,
      ice,
      tracteur,
      date,
      chargement,
      dechargement,
      totalHT,
      trajetId
    } = req.body;

    totalHT = Number(totalHT);

    // Récupération complète du trajet
    const trajet = await Trajet.findById(trajetId).populate('vehicule partenaire');
    if (!trajet) {
      return res.status(404).json({ message: 'Trajet introuvable' });
    }

    // Forcer le typage du partenaire populé
    const partenaire = trajet.partenaire as unknown as { ice?: string; nom?: string };

    // Compléter les champs manquants
    if (!ice && partenaire?.ice) ice = partenaire.ice;
    if (!client && partenaire?.nom) client = partenaire.nom;

    if (!ice || !client) {
      return res.status(400).json({ message: 'Le champ ICE ou Client est manquant.' });
    }

    const tva = totalHT * 0.1;
    const totalTTC = totalHT + tva;

    const factureData = {
      numeroFacture,
      client,
      ice,
      tracteur,
      date,
      chargement,
      dechargement,
      totalHT,
      tva,
      totalTTC,
      trajet
    };

    const templatePath = path.join(__dirname, '../templates/facture.ejs');
    const html = await ejs.renderFile(templatePath, { data: factureData });

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const fileName = `facture_${numeroFacture.replace('/', '-')}_${Date.now()}.pdf`;
    const outputDir = path.join(__dirname, '../public/factures');
    const outputPath = path.join(outputDir, fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await page.pdf({ path: outputPath, format: 'A4' });
    await browser.close();

    const facture = new Facture({
      numero: numeroFacture,
      client,
      ice,
      tracteur,
      date,
      chargement,
      dechargement,
      totalHT,
      tva,
      totalTTC,
      trajet: trajetId,
      pdfPath: `/uploads/factures/${fileName}`,
      payee: false
    });

    await facture.save();

    return res.status(201).json({ message: 'Facture générée', url: facture.pdfPath });
  } catch (err) {
    console.error('❌ Erreur génération facture :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateFacture = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updated = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur mise à jour facture :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getAllFactures = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const factures = await Facture.find().sort({ date: -1 });
    return res.status(200).json(factures);
  } catch (err) {
    console.error('Erreur récupération factures :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
