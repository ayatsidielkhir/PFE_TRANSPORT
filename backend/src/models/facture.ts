import mongoose from 'mongoose';

const ligneSchema = new mongoose.Schema({
  date: { type: String, required: true },
  remorque: { type: String, required: true },
  chargement: { type: String, required: true },
  dechargement: { type: String, required: true },
  totalHT: { type: Number, required: true }
});

const factureSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    mois: { type: String }, // ex: 2024-05
    partenaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Partenaire', required: true },
    ice: { type: String },
    tracteur: { type: String },
    lignes: [ligneSchema],
    tva: { type: Number, required: true },
    totalHT: { type: Number, required: true },
    totalTTC: { type: Number, required: true },
    fileUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Facture', factureSchema);
