import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  statut: { type: String, default: 'valide' }, // si tu utilises ce champ

  entityType: {
    type: String,
    required: true,
    enum: ['chauffeur', 'vehicule'], // 👈 très important
  },

  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType', // 👈 lien dynamique
  }
}, {
  timestamps: true,
});

export default mongoose.model('Document', documentSchema);
