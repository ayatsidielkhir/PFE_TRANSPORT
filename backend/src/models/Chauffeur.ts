import mongoose from 'mongoose';

const chauffeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  telephone: { type: String, required: true },
  cin: { type: String, required: true },
  adresse: { type: String, required: false },
  observations: { type: String },
  permis: {
    date_expiration: { type: Date }
  },
  contrat: {
    type: { type: String },
    date_expiration: { type: Date }
  },
  visa: {
    actif: { type: Boolean },
    date_expiration: { type: Date }
  },
   dateExpirationCIN: {
  type: Date,
  required: false
},
autresDocs: [{
  nom: String,
  fichier: String
}],
  scanPermis: { type: String },
  scanVisa: { type: String },
  scanCIN: { type: String },
  photo: { type: String }, // image chauffeur
  certificatBonneConduite: { type: String }
}, { timestamps: true });

export default mongoose.model('Chauffeur', chauffeurSchema);
