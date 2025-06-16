import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Parcours les fichiers par dossier
router.get('/debug', (req, res) => {
  const baseUploadPath = '/mnt/data/uploads';
  const folders = ['chauffeurs', 'vehicules', 'juridique', 'platforms', 'factures', 'caisse', 'partenaires'];
  const result: Record<string, string[]> = {};

  folders.forEach(folder => {
    const dirPath = path.join(baseUploadPath, folder);
    if (fs.existsSync(dirPath)) {
      result[folder] = fs.readdirSync(dirPath);
    } else {
      result[folder] = [];
    }
  });

  res.json(result);
});

export default router;
