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
import trajetRoutes from './routes/trajet.routes';  // Votre routeur de trajets
import dashboardRoutes from './routes/Dashboard..routes';  // Correction du nom de fichier

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Très important

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

// Connexion à MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // Routes API
    app.use('/auth', authRoutes);
    app.use('/api/chauffeurs', chauffeurRoutes);
    app.use('/api/vehicules', vehiculeRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/trajets', trajetRoutes);  // Utilisation de votre routeur
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use("/api/ocr", ocrRoutes);

    // Middleware pour les uploads
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // Démarrage du serveur
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
