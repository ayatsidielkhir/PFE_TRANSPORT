import { RequestHandler } from "express";
import Tesseract from "tesseract.js";
import dayjs from "dayjs";
import fs from "fs";

export const processDocument: RequestHandler = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "Aucun fichier reçu" });
      return;
    }

    const imagePath = file.path;

    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');

    const nomMatch = text.match(/nom\s*[:\-]?\s*([A-Za-z]+)/i);
    const dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);

    const nom = nomMatch ? nomMatch[1] : null;
    const dateStr = dateMatch ? dateMatch[1].replace(/\//g, '-') : null;
    const dateExpiree = dateStr ? dayjs(dateStr).isBefore(dayjs()) : null;

    fs.unlinkSync(imagePath); // Supprimer le fichier temporaire

    res.json({
      texte: text,
      extrait: {
        nom,
        date: dateStr,
        expiree: dateExpiree,
      },
    });

  } catch (err) {
    console.error("❌ OCR Error:", err);
    res.status(500).json({ message: "Erreur lors de l’analyse OCR" });
  }
};
