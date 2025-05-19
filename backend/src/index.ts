import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import ocrRoutes from './routes/ocr.routes';
import authRoutes from './routes/auth.routes';
import chauffeurRoutes from './routes/chauffeur.routes';
import vehiculeRoutes from './routes/vehicule.routes';
import documentRoutes from './routes/document.routes';
import trajetRoutes from './routes/trajet.routes'; 
import dashboardRoutes from './routes/Dashboard..routes';  
import partenaireRoutes from './routes/partenaire.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.use('/auth', authRoutes);
    app.use('/api/chauffeurs', chauffeurRoutes);
    app.use('/api/vehicules', vehiculeRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/trajets', trajetRoutes); 
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use("/api/ocr", ocrRoutes);
    app.use('/api/partenaires', partenaireRoutes);

    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
