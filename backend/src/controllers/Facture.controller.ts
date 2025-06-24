// backend/controllers/facture.controller.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import ejs from 'ejs';
import Facture from '../models/facture';
import Trajet from '../models/trajet.model';

export const generateManualFacture = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      numeroFacture, client, ice, tracteur, date,
      chargement, dechargement, totalHT, trajetId
    }: {
      numeroFacture: string,
      client: string,
      ice: string,
      tracteur: string,
      date: string,
      chargement: string,
      dechargement: string,
      totalHT: number,
      trajetId: string
    } = req.body;

    const trajet = await Trajet.findById(trajetId).populate('vehicule partenaire');
    if (!trajet) {
      res.status(404).json({ message: 'Trajet introuvable' });
      return;
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

    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const fileName = `facture_${numeroFacture.replace('/', '-')}_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '../public/factures', fileName);
    await page.pdf({ path: outputPath, format: 'a4' });

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
      pdfPath: `/factures/${fileName}`
    });
    await facture.save();

    res.status(201).json({ message: 'Facture générée', url: facture.pdfPath });
  } catch (err) {
    console.error('Erreur génération facture :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateFacture = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Facture non trouvée' });
      return;
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur mise à jour facture :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
