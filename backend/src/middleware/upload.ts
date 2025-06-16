import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ✅ Utilise toujours le chemin persistant de Render
const baseUploadPath = '/mnt/data/uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'autres';
    if (req.baseUrl.includes('vehicule')) folder = 'vehicules';
    else if (req.baseUrl.includes('chauffeur')) folder = 'chauffeurs';
    else if (req.baseUrl.includes('dossier-juridique')) folder = 'juridique';
    else if (req.baseUrl.includes('plateformes')) folder = 'platforms';
    else if (req.baseUrl.includes('factures')) folder = 'factures';
    else if (req.baseUrl.includes('caisse')) folder = 'caisse';
    else if (req.baseUrl.includes('partenaires')) folder = 'partenaires';

    const dir = path.resolve(baseUploadPath, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isVehiculeRoute = req.baseUrl.includes('vehicule');
  const isPhotoVehicule = file.fieldname === 'photoVehicule';

  if (isVehiculeRoute) {
    if (isPhotoVehicule) {
      if (/^image\/(jpeg|png|jpg|webp)$/i.test(file.mimetype)) {
        return cb(null, true);
      } else {
        return cb(new Error('Seules les images sont autorisées pour le véhicule (photoVehicule).'));
      }
    } else {
      if (file.mimetype === 'application/pdf') {
        return cb(null, true);
      } else {
        return cb(new Error('Seuls les fichiers PDF sont autorisés pour les documents du véhicule.'));
      }
    }
  }

  cb(null, true); // autorise les autres fichiers ailleurs
};

const upload = multer({ storage, fileFilter });

export default upload;
