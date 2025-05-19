import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  statut: { type: String, default: 'valide' }, 

  entityType: {
    type: String,
    required: true,
    enum: ['chauffeur', 'vehicule'], 
  },

  linkedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType', 
  }
}, {
  timestamps: true,
});

export default mongoose.model('Document', documentSchema);
