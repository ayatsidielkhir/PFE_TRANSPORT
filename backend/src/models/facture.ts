import mongoose, { Schema, Document } from 'mongoose';

interface ILigne {
  date: string;
  chargement: string;
  dechargement: string;
  totalHT: number;
  remorque: string;
}

export interface IFacture extends Document {
  numero: string;
  client: string;
  ice: string;
  tracteur: string;
  date: string;
  chargement: string;
  dechargement: string;
  totalHT: number;
  tva: number;
  totalTTC: number;
  trajet: mongoose.Types.ObjectId;
  pdfPath?: string; // ✅ CHAMP MANQUANT À AJOUTER
}

const FactureSchema: Schema = new Schema<IFacture>(
  {
    numero: { type: String, required: true },
    client: { type: String, required: true },
    ice: { type: String, required: true },
    tracteur: { type: String },
    date: { type: String, required: true },
    chargement: { type: String, required: true },
    dechargement: { type: String, required: true },
    totalHT: { type: Number, required: true },
    tva: { type: Number, required: true },
    totalTTC: { type: Number, required: true },
    trajet: { type: Schema.Types.ObjectId, ref: 'Trajet' },
    pdfPath: { type: String } // ✅ CHAMP AJOUTÉ ICI
  },
  { timestamps: true }
);

export default mongoose.model<IFacture>('Facture', FactureSchema);
