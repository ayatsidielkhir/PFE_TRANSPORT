import mongoose from 'mongoose';

const vehiculeSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true
    },
    matricule: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['Camion', 'Tracteur', 'Voiture'],
      required: true
    },
    kilometrage: {
      type: Number,
      required: true
    },
    controle_technique: {
      type: String,
      required: true
    },
    assurance: {
      type: String // nom du fichier image/pdf
    },
    carteGrise: {
      type: String // nom du fichier image/pdf
    },
    chauffeur: {
      type: String // nom complet du chauffeur
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Vehicule', vehiculeSchema);
