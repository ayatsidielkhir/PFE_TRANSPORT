import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Fonction pour déterminer le répertoire de stockage en fonction de l'URL
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Déterminer le dossier en fonction de l'URL
    let folder = 'autres'; // Dossier par défaut
    if (req.baseUrl.includes('vehicule')) {
      folder = 'vehicules';
    } else if (req.baseUrl.includes('chauffeur')) {
      folder = 'chauffeurs';
    } else if (req.baseUrl.includes('dossier-juridique')) {
      folder = 'juridique'; // Dossier spécifique pour les fichiers 'dossier-juridique'
    }

    const dir = path.resolve(__dirname, `../../uploads/${folder}`);

    // Vérifier si le répertoire existe, sinon le créer
    if (!fs.existsSync(dir)) {
      console.log(`Le répertoire ${folder} n'existe pas. Création du répertoire...`);
      fs.mkdirSync(dir, { recursive: true }); // Créer tous les sous-répertoires nécessaires
      console.log(`Répertoire créé à : ${dir}`);
    } else {
      console.log(`Le répertoire ${folder} existe déjà à : ${dir}`);
    }

    cb(null, dir); // Utiliser le répertoire spécifié pour stocker les fichiers
  },
  filename: function (_req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname; // Nom unique pour éviter les conflits
    cb(null, uniqueName); // Générer un nom unique pour chaque fichier
  }
});

const upload = multer({ storage }); // Initialiser Multer avec la configuration de stockage

// Exporter la configuration pour l'utiliser dans d'autres fichiers
export default upload;
