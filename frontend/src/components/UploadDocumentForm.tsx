import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, Select, InputLabel,
  FormControl, Button, Typography
} from '@mui/material';
import axios from 'axios';

interface Chauffeur {
  _id: string;
  nom: string;
}

interface Vehicule {
  _id: string;
  matricule: string;
}

interface DocumentEditData {
  _id?: string;
  type: string;
  entityType: 'chauffeur' | 'vehicule';
  linkedTo: string;
  expirationDate: string;
  fileName?: string;
}

interface Props {
  onUploadSuccess: () => void;
  editData?: DocumentEditData | null;
}

const UploadDocumentForm: React.FC<Props> = ({ onUploadSuccess, editData }) => {
  const [type, setType] = useState('');
  const [entityType, setEntityType] = useState<'chauffeur' | 'vehicule'>('chauffeur');
  const [linkedTo, setLinkedTo] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);

  useEffect(() => {
    const fetchChauffeurs = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/chauffeurs');
        setChauffeurs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchVehicules = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/vehicules');
        setVehicules(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChauffeurs();
    fetchVehicules();
  }, []);

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setEntityType(editData.entityType);
      setLinkedTo(editData.linkedTo);
      setExpirationDate(editData.expirationDate.split('T')[0]);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !linkedTo || !expirationDate || (!file && !editData)) return;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('entityType', entityType);
    formData.append('linkedTo', linkedTo);
    formData.append('expirationDate', expirationDate);
    if (file) formData.append('fichier', file);

    try {
      if (editData?._id) {
        await axios.put(`http://localhost:5001/api/documents/${editData._id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/documents', formData);
      }
      onUploadSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const options = entityType === 'chauffeur' ? chauffeurs : vehicules;

  return (
    <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
      <Typography variant="subtitle1">{editData ? 'Modifier' : 'Ajouter'} un document</Typography>

      <TextField label="Type" value={type} onChange={(e) => setType(e.target.value)} required />

      <FormControl fullWidth>
        <InputLabel>Type de cible</InputLabel>
        <Select value={entityType} onChange={(e) => setEntityType(e.target.value as 'chauffeur' | 'vehicule')}>
          <MenuItem value="chauffeur">Chauffeur</MenuItem>
          <MenuItem value="vehicule">Véhicule</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel>{entityType === 'chauffeur' ? 'Chauffeur' : 'Véhicule'}</InputLabel>
        <Select value={linkedTo} onChange={(e) => setLinkedTo(e.target.value)}>
          {options.map((item) => (
            <MenuItem key={item._id} value={item._id}>
              {'nom' in item ? item.nom : item.matricule}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="date"
        label="Date d'expiration"
        InputLabelProps={{ shrink: true }}
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
        required
      />

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <Button type="submit" variant="contained" color="primary">
        {editData ? 'Enregistrer les modifications' : 'Uploader'}
      </Button>
    </Box>
  );
};

export default UploadDocumentForm;
