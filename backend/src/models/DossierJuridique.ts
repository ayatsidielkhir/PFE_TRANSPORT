import mongoose, { Document } from 'mongoose';

// Interface optionnelle pour typer les documents dynamiques
export interface DossierJuridiqueDoc extends Document {
  [key: string]: any; // chaque champ est une string (nom fichier)
}

const dossierJuridiqueSchema = new mongoose.Schema(
  {}, // aucun champ statique : on utilise des clés dynamiques
  {
    strict: false,           // autorise les champs non définis
    timestamps: true         // ajoute createdAt et updatedAt
  }
);

export default mongoose.model<DossierJuridiqueDoc>('DossierJuridique', dossierJuridiqueSchema);
