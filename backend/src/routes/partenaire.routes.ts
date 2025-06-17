import express from 'express';
import {
  getAllPartenaires,
  createPartenaire,
  deletePartenaire,
  updatePartenaire
} from '../controllers/partenaire.controller';
import upload from '../middleware/upload'; // ✅ import du middleware centralisé

const router = express.Router();

// Routes
router.get('/', getAllPartenaires);
router.post('/', upload.single('logo'), createPartenaire);  // ✅ upload depuis `uploads.ts`
router.put('/:id', upload.single('logo'), updatePartenaire); // ✅ idem
router.delete('/:id', deletePartenaire);

export default router;
