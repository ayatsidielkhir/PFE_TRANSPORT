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
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'contrat', maxCount: 1 }
]), createPartenaire);

router.put('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'contrat', maxCount: 1 }
]), updatePartenaire);router.delete('/:id', deletePartenaire);

export default router;
