import mongoose from 'mongoose';

const partenaireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  ice: { type: String, required: true },
  adresse: { type: String, required: true },
  email: { type: String, required: false },
  telephone: { type: String, required: false },
  logo: { type: String },
  contrat: { type: String }
}, { timestamps: true });

export default mongoose.model('Partenaire', partenaireSchema);
