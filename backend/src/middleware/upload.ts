import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Déterminer le dossier en fonction de l'URL
    let folder = 'autres';
    if (req.baseUrl.includes('vehicule')) {
      folder = 'vehicules';
    } else if (req.baseUrl.includes('chauffeur')) {
      folder = 'chauffeurs';
    }

    const dir = path.resolve(__dirname, `../../uploads/${folder}`);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

export default upload;
