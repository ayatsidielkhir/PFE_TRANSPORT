import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import chauffeurRoutes from './routes/chauffeur.routes';
import path from 'path';
import vehiculeRoutes from './routes/vehicule.routes';




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <== très important

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.use('/auth', authRoutes);
    app.use('/api/chauffeurs', chauffeurRoutes);
    app.use('/api/vehicules', vehiculeRoutes);
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/api/vehicules', vehiculeRoutes);

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
