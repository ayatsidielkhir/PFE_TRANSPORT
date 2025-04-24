import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'responsable'], default: 'responsable' }
});

export default mongoose.model('User', userSchema);
