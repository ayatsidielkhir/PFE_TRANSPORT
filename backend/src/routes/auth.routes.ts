// src/routes/auth.routes.ts
import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login); // 👈 ce "login" doit être une fonction

export default router;
