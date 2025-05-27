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
import dashboardRoutes from './routes/Dashboard..routes';  
import partenaireRoutes from './routes/partenaire.routes';
import dossierJuridiqueRoutes from './routes/dossierjuridique.routes';
import platformRoutes from './routes/plateformes.routes';
import factureRoutes from './routes/facture.routes';
import chargeRoutes from './routes/charge.routes';



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
    app.use('/api/trajets', trajetRoutes); 
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use("/api/ocr", ocrRoutes);
    app.use('/api/partenaires', partenaireRoutes);
    app.use('/api/dossier-juridique', dossierJuridiqueRoutes);
    app.use('/api/plateformes', platformRoutes);

    app.use('/api/factures', factureRoutes); // ✅ Ne pas ajouter `/manual` ici
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    app.use('/api/charges', chargeRoutes);


    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
