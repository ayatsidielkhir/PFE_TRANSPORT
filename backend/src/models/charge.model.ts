import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre', 'Sortie Caisse'],
    required: true,
  },
  autreType: {
  type: String,
  trim: true,
},
  description: {
    type: String,
    trim: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  statut: {
    type: String,
    enum: ['Payé', 'Non payé'],
    default: 'Non payé',
  },
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
  },
   vehicule: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Vehicule',
},
  notes: {
    type: String,
  },
  lienCaisse: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Caisse'
}

}, { timestamps: true });

export default mongoose.model('Charge', chargeSchema);
