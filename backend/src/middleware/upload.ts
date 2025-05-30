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
    } else if (req.baseUrl.includes('dossier-juridique')) {
      folder = 'juridique';
    }

    // ✅ Chemin dans le disque persistant monté sur Render
    const dir = path.resolve('/mnt/data/uploads', folder);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dir)) {
      console.log(`Le répertoire ${folder} n'existe pas. Création du répertoire...`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Répertoire créé à : ${dir}`);
    } else {
      console.log(`Le répertoire ${folder} existe déjà à : ${dir}`);
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
