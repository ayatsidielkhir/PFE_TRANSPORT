import mongoose from 'mongoose';

const VehiculeSchema = new mongoose.Schema({
  marque: { type: String, required: true },
  modele: { type: String, required: true },
  matricule: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  date_mise_en_circulation: { type: Date },
  assurance: { type: Date },
  carte_grise: { type: Date },
  visite_technique: { type: Date },
  km_actuel: { type: Number, default: 0 },
  en_service: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('Vehicule', VehiculeSchema);
