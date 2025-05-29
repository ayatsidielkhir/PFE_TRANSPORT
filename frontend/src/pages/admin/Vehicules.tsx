import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Avatar, Typography, Dialog, MenuItem, Select,
  FormControl, InputLabel, Pagination
} from '@mui/material';
import { Add, Delete, Edit, Search, Download } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Vehicule>({
    nom: '', matricule: '', type: '', kilometrage: 0,
    controle_technique: '', chauffeur: '', assurance: '', carteGrise: ''
  });

  const [assuranceFile, setAssuranceFile] = useState<File | null>(null);
  const [carteGriseFile, setCarteGriseFile] = useState<File | null>(null);
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);
  const [agrementFile, setAgrementFile] = useState<File | null>(null);
  const [carteVerteFile, setCarteVerteFile] = useState<File | null>(null);
  const [extincteurFile, setExtincteurFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

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

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = () => {
    setForm({ nom: '', matricule: '', type: '', kilometrage: 0,
      controle_technique: '', chauffeur: '', assurance: '', carteGrise: '' });
    setAssuranceFile(null);
    setCarteGriseFile(null);
    setVignetteFile(null);
    setAgrementFile(null);
    setCarteVerteFile(null);
    setExtincteurFile(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setForm({ ...vehicule });
    setAssuranceFile(null);
    setCarteGriseFile(null);
    setVignetteFile(null);
    setAgrementFile(null);
    setCarteVerteFile(null);
    setExtincteurFile(null);
    setIsEditing(true);
    setDrawerOpen(true);
    if (isEditing) {
      const confirmUpdate = window.confirm("Voulez-vous vraiment modifier ce véhicule ?");
      if (!confirmUpdate) return;
    }
  };

  const handleSave = async () => {
    if (!form.nom || !form.matricule || !form.type || !form.kilometrage || !form.controle_technique) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (assuranceFile) formData.append('assurance', assuranceFile);
    if (carteGriseFile) formData.append('carteGrise', carteGriseFile);
    if (vignetteFile) formData.append('vignette', vignetteFile);
    if (agrementFile) formData.append('agrement', agrementFile);
    if (carteVerteFile) formData.append('carteVerte', carteVerteFile);
    if (extincteurFile) formData.append('extincteur', extincteurFile);
    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/vehicules/${form._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await axios.post('/api/vehicules', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if ([200, 201].includes(res.status)) {
        fetchVehicules();
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'enregistrement :', err);
      alert("Erreur lors de l'enregistrement du véhicule.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      try {
        await axios.delete(`/api/vehicules/${id}`);
        fetchVehicules();
        alert('Véhicule supprimé avec succès.');
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderFileAvatar = (file?: string) => {
    if (!file) return 'N/A';
    const url = `https://mme-backend.onrender.com/uploads/vehicules/${file}`;
    const isPdf = /\.pdf$/i.test(file);
    return (
      <Avatar
        src={isPdf ? '/pdf-icon.png' : url}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => setPreviewFileUrl(url)}
      />
    );
  };

  const filtered = vehicules.filter(v =>
    (v.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (v.matricule?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Gestion des Véhicules
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Rechercher..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: '35%', backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#001447', borderRadius: 3, fontWeight: 'bold', textTransform: 'none', px: 3 }} onClick={handleAdd}>
            Ajouter Véhicule
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                {['Nom', 'Chauffeur', 'Matricule', 'Type', 'Km', 'CT', 'Assurance', 'Carte Grise', 'Vignette', 'Agrément', 'Carte Verte', 'Extincteur', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#2D2D90' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{v.nom}</TableCell>
                  <TableCell>{v.chauffeur}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage.toLocaleString()}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderFileAvatar(v.assurance)}</TableCell>
                  <TableCell>{renderFileAvatar(v.carteGrise)}</TableCell>
                  <TableCell>{renderFileAvatar(v.vignette)}</TableCell>
                  <TableCell>{renderFileAvatar(v.agrement)}</TableCell>
                  <TableCell>{renderFileAvatar(v.carteVerte)}</TableCell>
                  <TableCell>{renderFileAvatar(v.extincteur)}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton color="primary" onClick={() => handleEdit(v)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton color="error" onClick={() => handleDelete(v._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;