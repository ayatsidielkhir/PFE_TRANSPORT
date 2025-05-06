import { Router } from 'express';
import upload from '../middleware/upload';
import {
  getAllDocuments,
  uploadDocument,
  updateDocument
} from '../controllers/document.controller';

const router = Router();

router.get('/', getAllDocuments);
router.post('/', upload.single('fichier'), uploadDocument);
router.put('/:id', upload.single('fichier'), updateDocument);

export default router;
