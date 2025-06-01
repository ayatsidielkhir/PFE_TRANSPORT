import express, { Request, Response } from 'express';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/test-upload', upload.single('fichier'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'Aucun fichier reçu.' });
    return;
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/autres/${req.file.filename}`;
  res.status(200).json({ message: 'Fichier reçu et enregistré.', fileUrl });
});

export default router;
