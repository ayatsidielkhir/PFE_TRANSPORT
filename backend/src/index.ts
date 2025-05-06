import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import chauffeurRoutes from './routes/chauffeur.routes';
import vehiculeRoutes from './routes/vehicule.routes';
import documentRoutes from './routes/document.routes';
import trajetRoutes from './routes/trajet.routes';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // très important

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Routes API
    app.use('/auth', authRoutes);
    app.use('/api/chauffeur', chauffeurRoutes);  // ✅ corrigé (sans 's')
    app.use('/api/vehicule', vehiculeRoutes);    // ✅ corrigé (sans 's')
    app.use('/api/documents', documentRoutes);
    app.use('/api/trajets', trajetRoutes);

    // Serve static files (e.g. uploaded files)
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
