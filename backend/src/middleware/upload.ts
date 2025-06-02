import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'autres';
    if (req.baseUrl.includes('vehicule')) folder = 'vehicules';
    else if (req.baseUrl.includes('chauffeur')) folder = 'chauffeurs';
    else if (req.baseUrl.includes('dossier-juridique')) folder = 'juridique';
    else if (req.baseUrl.includes('plateformes')) folder = 'platforms';
    else if (req.baseUrl.includes('factures')) folder = 'factures';

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

// ✅ Accepter uniquement PDF pour tous sauf "photoVehicule"
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isVehiculeRoute = req.baseUrl.includes('vehicule');
  const isPhotoVehicule = file.fieldname === 'photoVehicule';

  if (isVehiculeRoute) {
    if (isPhotoVehicule) {
      // Accepter uniquement les images pour photoVehicule
      if (/^image\/(jpeg|png|jpg|webp)$/.test(file.mimetype)) {
        return cb(null, true);
      } else {
        return cb(new Error('Seules les images sont autorisées pour le véhicule (photoVehicule).'));
      }
    } else {
      // Tous les autres fichiers doivent être PDF
      if (file.mimetype === 'application/pdf') {
        return cb(null, true);
      } else {
        return cb(new Error('Seuls les fichiers PDF sont autorisés pour les documents du véhicule.'));
      }
    }
  }

  // Si ce n’est pas la route /vehicule, tout passe
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
