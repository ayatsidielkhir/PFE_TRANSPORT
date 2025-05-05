import mongoose from 'mongoose';

const chauffeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  telephone: { type: String, required: true },
  permis: {
    type: { type: String, required: true },
    date_expiration: { type: Date, required: true },
  },
  contrat: {
    type: { type: String, required: true },
    date_expiration: { type: Date, required: true },
  },
  visa: {
    actif: { type: Boolean, default: false },
    date_expiration: { type: Date },
  },
  cin: { type: String, required: true, unique: true },
  adresse: String,
  scanPermis: String,
  scanVisa: String,
  scanCIN: String,
  observations: String,
}, { timestamps: true });

export default mongoose.model('Chauffeur', chauffeurSchema);
