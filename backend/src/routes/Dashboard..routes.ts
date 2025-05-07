// src/routes/dashboard.routes.ts
import express from 'express';
import { getDashboardStats } from '../controllers/Dashboard.controller';

const router = express.Router();

router.get('/', getDashboardStats);

export default router;
