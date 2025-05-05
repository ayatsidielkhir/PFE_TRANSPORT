import mongoose from 'mongoose';

const vehiculeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  matricule: { type: String, required: true },
  type: { type: String, required: true },
  kilometrage: { type: Number, required: true },
  controle_technique: { type: String, required: true },
  assurance: { type: String, required: true },
  carteGrise: { type: String } // <-- nouveau champ
}, { timestamps: true });

export default mongoose.model('Vehicule', vehiculeSchema);
