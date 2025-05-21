import mongoose from 'mongoose';

const dossierJuridiqueSchema = new mongoose.Schema({
  modelJ: String,
  statut: String,
  rc: String,
  identifiantFiscale: String,
  cinGerant: String,
  doc1007: String,
}, { timestamps: true });

export default mongoose.model('DossierJuridique', dossierJuridiqueSchema);
