import express from 'express';
import upload from '../middleware/upload';
import { getAllDocuments, uploadDocument } from '../controllers/document.controller';

const router = express.Router();

router.get('/', getAllDocuments); // GET /api/documents
router.post('/upload', upload.single('file'), uploadDocument); // POST /api/documents/upload

export default router;
