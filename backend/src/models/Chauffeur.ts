// src/models/Chauffeur.ts
import mongoose from 'mongoose';

const chauffeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  permis: {
    type: {
      type: String, required: true // ex: B, C, D
    },
    date_expiration: { type: Date, required: true }
  },
  visa: {
    actif: { type: Boolean, default: false },
    date_expiration: { type: Date }
  },
  contrat: {
    type: { type: String, required: true }, // ex: CDI, CDD
    date_expiration: { type: Date, required: true }
  },
  telephone: { type: String, required: true },
  adresse: { type: String },
  cin: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

export default mongoose.model('Chauffeur', chauffeurSchema);
