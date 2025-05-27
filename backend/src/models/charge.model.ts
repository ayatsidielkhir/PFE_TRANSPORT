import mongoose from 'mongoose';

const chargeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'],
      required: true,
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
    }
  },
  { timestamps: true }
);

export default mongoose.model('Charge', chargeSchema);
