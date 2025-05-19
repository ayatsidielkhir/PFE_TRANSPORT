import mongoose from 'mongoose';

const chauffeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  telephone: { type: String, required: true },
  cin: { type: String, required: true, unique: true },
  adresse: { type: String },
  observations: { type: String },
  permis: {
    type: {
      type: String,
      required: true,
    },
    date_expiration: {
      type: Date,
      required: true,
    },
  },
  contrat: {
    type: {
      type: String,
      required: false, 
    },
    date_expiration: {
      type: Date,
      required: true,
    },
  },
  visa: {
    actif: { type: Boolean, default: false },
    date_expiration: { type: Date },
  },
  scanPermis: { type: String },
  scanVisa: { type: String },
  scanCIN: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Chauffeur', chauffeurSchema);
