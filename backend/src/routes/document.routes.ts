import express from 'express';
import upload from '../middleware/upload'; // 👈 très important
import {
  getAllDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument
} from '../controllers/document.controller';

const router = express.Router();

router.get('/', getAllDocuments);
router.post('/', upload.single('fichier'), uploadDocument); // 👈 ici fichier = nom du champ envoyé
router.put('/:id', upload.single('fichier'), updateDocument);
router.delete('/:id', deleteDocument);

export default router;
