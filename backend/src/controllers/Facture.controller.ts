import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import ejs from 'ejs';
import Facture from '../models/facture';
import Trajet from '../models/trajet.model';

export const requestHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const generateManualFacture = requestHandler(async (req: Request, res: Response): Promise<Response> => {
  let {
    numeroFacture, client, ice, tracteur, date, trajetIds, remorques, montantsHT
  } = req.body;

  const trajets = await Trajet.find({ _id: { $in: trajetIds } }).populate('vehicule partenaire');
  if (!trajets.length) return res.status(404).json({ message: 'Aucun trajet trouvé' });

  const partenaire = trajets[0].partenaire as unknown as { ice?: string; nom?: string };
  if (!ice && partenaire?.ice) ice = partenaire.ice;
  if (!client && partenaire?.nom) client = partenaire.nom;

  if (!ice || !client) {
    return res.status(400).json({ message: 'Le champ ICE ou Client est manquant.' });
  }

  let totalHT = 0;
  const lignes = trajets.map((trajet, index) => {
    const montant = Number(montantsHT?.[index] || 0);
    totalHT += montant;
    return {
      date: trajet.date,
      chargement: trajet.depart,
      dechargement: trajet.arrivee,
      totalHT: montant,
      remorque: remorques?.[index] || ''
    };
  });

  const tva = totalHT * 0.1;
  const totalTTC = totalHT + tva;

  const factureData = {
    numeroFacture, client, ice, tracteur, date,
    totalHT, tva, totalTTC, lignes
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
  const outputDir = '/mnt/data/uploads/factures';
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
  totalHT,
  tva,
  totalTTC,
  trajet: trajets[0]._id,
  pdfPath: `/uploads/factures/${fileName}`,
  payee: false,
  chargement: trajets[0].depart,
  dechargement: trajets[0].arrivee
});
  

  await facture.save();

  return res.status(201).json({ message: 'Facture générée', url: facture.pdfPath });
});

export const updateFacture = requestHandler(async (req: Request, res: Response): Promise<Response> => {
  const updated = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Facture non trouvée' });
  return res.status(200).json(updated);
});

export const getAllFactures = requestHandler(async (_req: Request, res: Response): Promise<Response> => {
  const factures = await Facture.find().sort({ date: -1 });
  return res.status(200).json(factures);
});

export const deleteFacture = requestHandler(async (req: Request, res: Response): Promise<Response> => {
  const facture = await Facture.findById(req.params.id);
  if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });

  // Supprimer le fichier PDF associé s’il existe
  const filePath = path.join('/mnt/data', facture.pdfPath || '');
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Facture.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: 'Facture supprimée avec succès' });
});
