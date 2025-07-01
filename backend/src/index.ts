import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';

import ocrRoutes from './routes/ocr.routes';
import authRoutes from './routes/auth.routes';
import chauffeurRoutes from './routes/chauffeur.routes';
import vehiculeRoutes from './routes/vehicule.routes';
import trajetRoutes from './routes/trajet.routes';
import dashboardRoutes from './routes/Dashboard.routes';
import partenaireRoutes from './routes/partenaire.routes';
import dossierJuridiqueRoutes from './routes/dossierjuridique.routes';
import platformRoutes from './routes/plateformes.routes';
import factureRoutes from './routes/facture.routes';
import chargeRoutes from './routes/charge.routes';
import caisseRoutes from './routes/caisse.routes';
import uploadsRoutes from './routes/uploads.routes';


dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://mme-express.ma',
];

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    app.use('/api/auth', authRoutes);
    app.use('/api/chauffeurs', chauffeurRoutes);
    app.use('/api/vehicules', vehiculeRoutes);
    app.use('/api/trajets', trajetRoutes);
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use('/api/ocr', ocrRoutes);
    app.use('/api/partenaires', partenaireRoutes);
    app.use('/api/dossier-juridique', dossierJuridiqueRoutes);
    app.use('/api/plateformes', platformRoutes);
    app.use('/api/factures', factureRoutes);
    app.use('/api/charges', chargeRoutes);
    app.use('/api/caisse', caisseRoutes);
    app.use('/api/uploads', uploadsRoutes);


    // ✅ Chemins statiques vers les fichiers
    app.use('/uploads/chauffeurs', express.static('/mnt/data/uploads/chauffeurs'));
    app.use('/uploads/vehicules', express.static('/mnt/data/uploads/vehicules'));
    app.use('/uploads/juridique', express.static('/mnt/data/uploads/juridique'));
    app.use('/uploads/platforms', express.static('/mnt/data/uploads/platforms'));
    app.use('/uploads/factures', express.static('/mnt/data/uploads/factures'));
    app.use('/uploads/caisse', express.static('/mnt/data/uploads/caisse'));
    app.use('/uploads/partenaires', express.static('/mnt/data/uploads/partenaires')); // ✅ Corrigé

    app.get('/', (_req, res) => {
      res.send("Bienvenue sur l'API backend");
    });

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
