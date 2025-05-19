import express from 'express';
import multer from 'multer';
import { getAllPartenaires, createPartenaire, deletePartenaire } from '../controllers/partenaire.controller';
import { updatePartenaire } from '../controllers/partenaire.controller';

const router = express.Router();

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
router.put('/:id', upload.single('logo'), updatePartenaire);


export default router;
