import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'autres';
    if (req.baseUrl.includes('vehicule')) {
      folder = 'vehicules';
    } else if (req.baseUrl.includes('chauffeur')) {
      folder = 'chauffeurs';
    } else if (req.baseUrl.includes('dossier-juridique')) {
      folder = 'juridique';
    }

    const dir = path.resolve('/mnt/data/uploads', folder);

    if (!fs.existsSync(dir)) {
      console.log(`📁 Création du répertoire : ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`📁 Répertoire existant : ${dir}`);
    }

    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    console.log('✅ Fichier enregistré :', uniqueName);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
export default upload;
