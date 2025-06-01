import express, { Request, Response } from 'express';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/test-upload', upload.single('fichier'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('Aucun fichier reçu');
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/autres/${req.file.filename}`;
    res.status(200).json({ message: 'Fichier reçu et enregistré.', fileUrl });
  } catch (error: any) {
    console.error('❌ Erreur test-upload :', error.message);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


export default router;
