import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // visa, permis, assurance, etc.
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  expirationDate: { type: Date, required: true },
  entityType: { type: String, enum: ['chauffeur', 'vehicule'], required: true },
  linkedTo: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' }
}, {
  timestamps: true
});

export default mongoose.model('Document', documentSchema);
