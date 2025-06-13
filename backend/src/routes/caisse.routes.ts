import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  getOperations,
  addOperation,
  updateOperation,
  deleteOperation
} from '../controllers/caisse.controller';

const router = Router();

const dir = path.resolve(__dirname, '../../uploads/caisse');
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.get('/', getOperations);
router.post('/', upload.single('justificatif'), addOperation);
router.put('/:id', upload.single('justificatif'), updateOperation);
router.delete('/:id', deleteOperation);

router.get('/download/:filename', (req: Request, res: Response) => {
  const filePath = path.resolve(dir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Fichier introuvable' });
  }
  res.download(filePath);
});

export default router;
