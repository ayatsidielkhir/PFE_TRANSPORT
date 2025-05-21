import mongoose from 'mongoose';

const platformSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String },
  password: { type: String },
  lien: { type: String },
  logo: { type: String }, // nom de fichier image
}, { timestamps: true });

export default mongoose.model('Platform', platformSchema);
