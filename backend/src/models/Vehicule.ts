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
      required: true,
      set: (val: string) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
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
      type: String
    },
    carteGrise: {
      type: String
    },
    vignette: {
      type: String
    },
    agrement: {
      type: String
    },
    carteVerte: {
      type: String
    },
    extincteur: {
      type: String
    },
    chauffeur: {
      type: String
    },
    photo: { // ✅ Ajout du champ photo
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Vehicule', vehiculeSchema);
