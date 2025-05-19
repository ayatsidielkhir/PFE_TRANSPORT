import mongoose from 'mongoose';

const partenaireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  ice: { type: String, required: true },
  logo: { type: String }, // stocke juste le nom du fichier
  adresse: { type: String }
}, { timestamps: true });

export default mongoose.model('Partenaire', partenaireSchema);
