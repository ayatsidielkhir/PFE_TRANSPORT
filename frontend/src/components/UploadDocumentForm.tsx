import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Chauffeur {
  _id: string;
  nom: string;
}

interface Vehicule {
  _id: string;
  matricule: string;
}

interface Props {
  onUploadSuccess: () => void;
}

const UploadDocumentForm: React.FC<Props> = ({ onUploadSuccess }) => {
  const [type, setType] = useState('');
  const [entityType, setEntityType] = useState<'chauffeur' | 'vehicule'>('chauffeur');
  const [linkedTo, setLinkedTo] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);

  useEffect(() => {
    const fetchChauffeurs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/chauffeur');
        setChauffeurs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchVehicules = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/vehicule');
        setVehicules(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChauffeurs();
    fetchVehicules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !linkedTo || !dateExpiration || !file) return;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('entityType', entityType);
    formData.append('linkedTo', linkedTo);
    formData.append('date_expiration', dateExpiration);
    formData.append('fichier', file);

    try {
      await axios.post('http://localhost:3000/api/documents', formData);
      onUploadSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const options = entityType === 'chauffeur' ? chauffeurs : vehicules;

  return (
    <form onSubmit={handleSubmit}>
      <label>Type:</label>
      <input value={type} onChange={(e) => setType(e.target.value)} required />

      <label>Type de cible:</label>
      <select value={entityType} onChange={(e) => setEntityType(e.target.value as 'chauffeur' | 'vehicule')}>
        <option value="chauffeur">Chauffeur</option>
        <option value="vehicule">Véhicule</option>
      </select>

      <label>Choisir {entityType}:</label>
      <select value={linkedTo} onChange={(e) => setLinkedTo(e.target.value)} required>
        <option value="">-- Sélectionner --</option>
        {options.map((item) => (
          <option key={item._id} value={item._id}>
            {'nom' in item ? item.nom : item.matricule}
          </option>
        ))}
      </select>

      <label>Date d'expiration:</label>
      <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} required />

      <label>Fichier:</label>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />

      <button type="submit" className="btn-add">Uploader</button>
    </form>
  );
};

export default UploadDocumentForm;
