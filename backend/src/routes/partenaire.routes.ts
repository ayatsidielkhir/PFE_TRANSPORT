import express from 'express';
import multer from 'multer';
import { getAllPartenaires, createPartenaire, deletePartenaire } from '../controllers/partenaire.controller';

const router = express.Router();

// Configuration de l’upload logo
const storage = multer.diskStorage({
  destination: 'uploads/partenaires/',
  filename: (_, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', getAllPartenaires);
router.post('/', upload.single('logo'), createPartenaire);
router.delete('/:id', deletePartenaire);

export default router;
