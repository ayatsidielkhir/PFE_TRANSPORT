// ✅ FRONTEND CORRIGÉ : VehiculesPage.tsx

// 🔁 Importations et hooks (inchangés)
import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  InputAdornment, Typography, Avatar, Pagination, Dialog, DialogTitle, DialogContent,
  Drawer, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, PictureAsPdf, Add } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';

// 🔁 Interfaces (inchangées)
interface Vehicule {
  _id?: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  controle_technique: string;
  assurance: string;
  carteGrise: string;
  vignette?: string;
  agrement?: string;
  carteVerte?: string;
  extincteur?: string;
  photo?: string;
  chauffeur?: string;
}

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehiculeDocs, setSelectedVehiculeDocs] = useState<Vehicule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [form, setForm] = useState<Partial<Vehicule & { photoVehicule?: File }>>({});
  const perPage = 5;
  const BACKEND_URL = 'https://mme-backend.onrender.com';

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('/api/vehicules');
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/api/chauffeurs');
    setChauffeurs(res.data);
  };

  const resetForm = () => {
    setForm({
      nom: '', matricule: '', type: '', kilometrage: 0,
      controle_technique: '', assurance: '', carteGrise: '', chauffeur: ''
    });
    setSelectedVehicule(null);
  };

  const handleAddVehicule = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setForm({ ...vehicule });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value as any);
    });

    const url = selectedVehicule ? `/api/vehicules/${selectedVehicule._id}` : `/api/vehicules`;
    const method = selectedVehicule ? axios.put : axios.post;

    try {
      await method(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchVehicules();
      setDrawerOpen(false);
      resetForm();
    } catch {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleChange = (field: keyof Vehicule | 'photoVehicule', value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const renderDocument = (file?: string) => {
    if (!file) return '—';
    const url = `${BACKEND_URL}/uploads/vehicules/${file}`;
    if (/(.png|.jpg|.jpeg)$/i.test(file)) {
      return <Avatar src={url} sx={{ width: 40, height: 40 }} onClick={() => window.open(url, '_blank')} />;
    }
    if (/\.pdf$/i.test(file)) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url, '_blank')}>
            <PictureAsPdf color="error" />
          </IconButton>
        </Tooltip>
      );
    }
    return <a href={url} target="_blank" rel="noopener noreferrer">📎 Fichier</a>;
  };

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box p={3} width={400}>
        {['nom', 'matricule', 'type', 'kilometrage', 'controle_technique'].map(field => (
          <TextField
            key={field}
            fullWidth
            label={field}
            value={form[field as keyof Vehicule] || ''}
            onChange={(e) => handleChange(field as keyof Vehicule, e.target.value)}
            sx={{ mb: 2 }}
          />
        ))}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Chauffeur</InputLabel>
          <Select
            value={form.chauffeur || ''}
            onChange={e => setForm({ ...form, chauffeur: e.target.value })}
            label="Chauffeur"
          >
            {chauffeurs.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {[ 'assurance', 'carteGrise', 'vignette', 'agrement', 'carteVerte', 'extincteur', 'photoVehicule' ].map(field => (
          <Box key={field} mb={2}>
            <Typography>{field}</Typography>
            <input
              name={field}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleChange(field as any, file);
              }}
            />
          </Box>
        ))}

        <Button fullWidth variant="contained" onClick={handleSubmit}>
          {selectedVehicule ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default VehiculesPage;
