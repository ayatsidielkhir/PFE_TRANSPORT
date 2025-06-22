import mongoose from 'mongoose';

const trajetSchema = new mongoose.Schema({
  depart: { type: String, required: true },
  arrivee: { type: String, required: true },
  date: { type: Date, required: true },
  chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Chauffeur', required: true },
  vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  distanceKm: { type: Number, required: true },
  consommationL: { type: Number, required: true },
  consommationMAD: { type: Number, required: false },
  partenaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Partenaire', required: false },
  importExport: { type: String, enum: ['import', 'export'], required: false },
  totalHT: { type: Number, required: false }, // ✅ AJOUTÉ ICI
  facturee: { type: Boolean, default: false }


}, { timestamps: true });

export default mongoose.model('Trajet', trajetSchema);
