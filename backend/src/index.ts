import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
import caisseRoutes from './routes/caisse.routes';
import notificationRoutes from './routes/notifications.routes';

dotenv.config();

const app = express();

// ✅ Étape 1 : Créer un serveur HTTP autour d'Express
const httpServer = createServer(app);

// ✅ Étape 2 : Créer une instance de socket.io
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // ton front
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ✅ Étape 3 : Stocker l'instance dans app.locals pour l'utiliser ailleurs
app.locals.io = io;

io.on('connection', (socket) => {
  console.log(`🟢 Nouveau client connecté : ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔴 Client déconnecté : ${socket.id}`);
  });
});

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
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
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes); // ✅

// ✅ Fichiers statiques
app.use('/uploads/caisse', express.static(path.join(__dirname, '../uploads/caisse')));

// ✅ Test API
app.get('/', (_req, res) => {
  res.send("Bienvenue sur l'API backend");
});

// ✅ Démarrage avec le serveur HTTP (et non app.listen)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur HTTP + Socket.IO lancé sur le port ${PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
