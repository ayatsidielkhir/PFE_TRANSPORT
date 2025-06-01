import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'autres';
    if (req.baseUrl.includes('vehicule')) folder = 'vehicules';
    else if (req.baseUrl.includes('chauffeur')) folder = 'chauffeurs';
    else if (req.baseUrl.includes('dossier-juridique')) folder = 'juridique';

    const dir = path.resolve('/mnt/data/uploads', folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
export default upload;
