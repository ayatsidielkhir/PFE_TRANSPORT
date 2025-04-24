import express from 'express';
import { createChauffeur, getAllChauffeurs, getChauffeurById, updateChauffeur, deleteChauffeur } from '../controllers/chauffeur.controller';

const router = express.Router();

router.post('/', createChauffeur);
router.get('/', getAllChauffeurs);
router.get('/:id', getChauffeurById);
router.put('/:id', updateChauffeur);
router.delete('/:id', deleteChauffeur);


export default router;
