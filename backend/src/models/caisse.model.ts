import mongoose from 'mongoose';

const operationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Entrée', 'Sortie'], required: true },
  montant: { type: Number, required: true },
  date: { type: Date, required: true },
  nom: { type: String, required: true },
  sujet: { type: String, required: true },
  modePaiement: { type: String, required: true },
  statut: { type: String, enum: ['Payé', 'Non payé'], required: true },
  justificatif: { type: String }, // facultatif
}, { timestamps: true });

export default mongoose.model('Operation', operationSchema);
