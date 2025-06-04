  import express from 'express';
  import multer from 'multer';
  import { getAllPartenaires, createPartenaire, deletePartenaire } from '../controllers/partenaire.controller';
  import { updatePartenaire } from '../controllers/partenaire.controller';
  import path from 'path';
  import fs from 'fs';

  const router = express.Router();

  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      const dir = path.resolve('/mnt/data/uploads/partenaires');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (_req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });

  router.get('/', getAllPartenaires);
  router.post('/', upload.single('logo'), createPartenaire);
  router.delete('/:id', deletePartenaire);
  router.put('/:id', upload.single('logo'), updatePartenaire);


  export default router;
