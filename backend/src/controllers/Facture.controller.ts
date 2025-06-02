import { RequestHandler } from 'express';
import Facture from '../models/facture';
import Partenaire from '../models/partenaire.model';
import puppeteer from 'puppeteer';
import path from 'path';
import ejs from 'ejs';
import fs from 'fs'; 


export const generateManualFacture: RequestHandler = async (req, res, next) => {
  try {
    const {
      client: clientId,
      ice,
      date,
      numero,
      lignes,
      tracteur,
      totalHT,
      tva,
      totalTTC,
    } = req.body;

    // 🔎 Chercher le nom du client
    const partenaire = await Partenaire.findById(clientId);
    const clientNom = partenaire?.nom || '—';

    // 📄 Générer le HTML à partir du template EJS
    const templatePath = path.resolve(__dirname, '../templates/facture.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');

    const html = ejs.render(template, {
      client: clientNom, // ✅ corrige le .nom dans le template
      ice,
      date,
      numero,
      lignes,
      tracteur,
      totalHT,
      tva,
      totalTTC
    });

    // 🚀 Lancer Puppeteer pour créer le PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // 📁 Créer le dossier de factures s'il n'existe pas
    const factureDir = path.resolve('/mnt/data/factures');
    if (!fs.existsSync(factureDir)) {
      fs.mkdirSync(factureDir, { recursive: true });
    }

    // 📝 Enregistrer le PDF dans le disque
    const fileName = `facture-${numero}.pdf`;
    const filePath = path.join(factureDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const fileUrl = `/uploads/factures/${fileName}`;

    // 💾 Enregistrer la facture dans MongoDB
    const saved = await Facture.create({
      numero,
      date,
      client: { nom: clientNom }, // pour affichage dans le frontend
      ice,
      tracteur,
      lignes,
      totalHT,
      tva,
      totalTTC,
      statut: 'impayée',
      fileUrl
    });

    // 📤 Réponse avec lien PDF
    res.status(201).json({ message: 'Facture générée', fileUrl });

  } catch (error) {
    console.error('❌ Erreur génération facture :', error);
    next(error);
  }
};



// ✅ Récupérer toutes les factures
export const getAllFactures: RequestHandler = async (_req, res) => {
  try {
    const factures = await Facture.find().populate('partenaire', 'nom').sort({ createdAt: -1 });
    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Dernière facture
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

// ✅ Supprimer une facture
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

// ✅ Modifier une facture
export const updateFacture: RequestHandler = async (req, res) => {
  try {
    const updated = await Facture.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: 'Facture non trouvée' });
      return;
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};

// ✅ Récupérer une facture par ID
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

// ✅ Modifier le statut (payée/impayée)
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
