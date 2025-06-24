import ejs from 'ejs';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright-core';

interface FactureParams {
  numero: string;
  date: string;
  client: string;
  ice: string;
  tracteur: string;
  lignes: {
    date: string;
    remorque: string;
    chargement: string;
    dechargement: string;
    totalHT: number;
  }[];
  totalHT: number;
  tva: number;
  totalTTC: number;
}

export async function generatePdfFacture({
  numero,
  date,
  client,
  ice,
  tracteur,
  lignes,
  totalHT,
  tva,
  totalTTC
}: FactureParams): Promise<string> {
  const templatePath = path.resolve(__dirname, '../templates/facture.ejs');
  const template = fs.readFileSync(templatePath, 'utf8');
  const html = ejs.render(template, { numero, date, client, ice, tracteur, lignes, totalHT, tva, totalTTC });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });

  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();

  const factureDir = path.resolve('/mnt/data/factures');
  if (!fs.existsSync(factureDir)) fs.mkdirSync(factureDir, { recursive: true });

  const fileName = `facture-${numero.replace('/', '-')}.pdf`;
  const filePath = path.join(factureDir, fileName);
  fs.writeFileSync(filePath, pdfBuffer);

  return `/uploads/factures/${fileName}`;
}
