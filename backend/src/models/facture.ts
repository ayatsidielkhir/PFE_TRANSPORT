import mongoose from 'mongoose';

const FactureSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  client: { type: String, required: true },
  ice: String,
  tracteur: String,
  date: { type: String, required: true },
  totalHT: Number,
  tva: Number,
  totalTTC: Number,
  pdfPath: String,
  payee: { type: Boolean, default: false },
  trajetIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trajet' }],
  chargement: String,
  dechargement: String,
  montantsHT: [Number],
  remorques: [String],
});

export default mongoose.model('Facture', FactureSchema);
