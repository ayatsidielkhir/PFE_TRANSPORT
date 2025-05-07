import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment, Drawer,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';

interface Vehicule {
  _id?: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  controle_technique: string;
  assurance: string;
  carteGrise?: string;
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Vehicule>({
    nom: '', matricule: '', type: '', kilometrage: 0,
    controle_technique: '', assurance: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('/vehicule'); // ✅ corrigé
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/chauffeur'); // ✅ corrigé
    setChauffeurs(res.data);
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = () => {
    setForm({ nom: '', matricule: '', type: '', kilometrage: 0, controle_technique: '', assurance: '' });
    setFile(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setForm({ ...vehicule });
    setFile(null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('matricule', form.matricule);
    formData.append('type', form.type);
    formData.append('kilometrage', String(form.kilometrage));
    formData.append('controle_technique', form.controle_technique);
    formData.append('assurance', form.assurance);
    if (file) formData.append('carteGrise', file);

    const res = isEditing && form._id
      ? await axios.put(`/vehicule/${form._id}`, formData) // ✅ corrigé
      : await axios.post('/vehicule', formData); // ✅ corrigé

    if (res.status === 200 || res.status === 201) {
      fetchVehicules();
      setDrawerOpen(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      await axios.delete(`/vehicule/${id}`); // ✅ corrigé
      fetchVehicules();
    }
  };

  const getDateColor = (dateStr: string) => {
    const days = (new Date(dateStr).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (days < 0) return { color: 'red', fontWeight: 'bold' };
    if (days < 30) return { color: 'orange', fontWeight: 'bold' };
    return {};
  };

  const filtered = vehicules.filter(v =>
    (v.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (v.matricule?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={600}>Véhicules</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Ajouter</Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Matricule</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Kilométrage</strong></TableCell>
                <TableCell><strong>Contrôle technique</strong></TableCell>
                <TableCell><strong>Assurance</strong></TableCell>
                <TableCell><strong>Carte Grise</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(v => (
                <TableRow key={v._id}>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage != null ? v.kilometrage.toLocaleString() : 'N/A'}</TableCell>
                  <TableCell style={getDateColor(v.controle_technique)}>{v.controle_technique}</TableCell>
                  <TableCell style={getDateColor(v.assurance)}>{v.assurance}</TableCell>
                  <TableCell>
                    {v.carteGrise && (
                      <a href={`http://localhost:5000/uploads/${v.carteGrise}`} target="_blank" rel="noopener noreferrer">
                        Voir
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(v)}>Modifier</Button>
                    <Button color="error" onClick={() => handleDelete(v._id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>
              {isEditing ? 'Modifier Véhicule' : 'Ajouter Véhicule'}
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Nom chauffeur</InputLabel>
                <Select
                  value={form.nom}
                  label="Nom chauffeur"
                  onChange={e => handleChange('nom', e.target.value)}
                >
                  {chauffeurs.map(c => (
                    <MenuItem key={c._id} value={`${c.nom} ${c.prenom}`}>{c.nom} {c.prenom}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField label="Matricule" value={form.matricule} onChange={e => handleChange('matricule', e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={form.type} onChange={e => handleChange('type', e.target.value)}>
                  <MenuItem value="Camion">Camion</MenuItem>
                  <MenuItem value="Tracteur">Tracteur</MenuItem>
                </Select>
              </FormControl>

              <TextField type="number" label="Kilométrage" value={form.kilometrage} onChange={e => handleChange('kilometrage', +e.target.value)} fullWidth />
              <TextField type="date" label="Contrôle technique" value={form.controle_technique} onChange={e => handleChange('controle_technique', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="date" label="Assurance" value={form.assurance} onChange={e => handleChange('assurance', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />

              <Typography>Carte Grise</Typography>
              <input type="file" accept="application/pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />

              <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </Layout>
  );
};

export default VehiculesPage;
