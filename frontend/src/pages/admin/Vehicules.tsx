import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Avatar, Typography, Dialog, MenuItem, Select, FormControl, InputLabel, Pagination
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
  assuranceFile?: string;
  carteGriseFile?: string;
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
    controle_technique: '', chauffeur: ''
  });
  const [assuranceFile, setAssuranceFile] = useState<File | null>(null);
  const [carteGriseFile, setCarteGriseFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('/vehicules');
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/chauffeurs');
    setChauffeurs(res.data);
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = () => {
    setForm({ nom: '', matricule: '', type: '', kilometrage: 0, controle_technique: '', chauffeur: '' });
    setCarteGriseFile(null);
    setAssuranceFile(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setForm({ ...vehicule });
    setCarteGriseFile(null);
    setAssuranceFile(null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (carteGriseFile) formData.append('carteGriseFile', carteGriseFile);
    if (assuranceFile) formData.append('assuranceFile', assuranceFile);

    const res = isEditing && form._id
      ? await axios.put(`/vehicules/${form._id}`, formData)
      : await axios.post('/vehicules', formData);

    if ([200, 201].includes(res.status)) {
      fetchVehicules();
      setDrawerOpen(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      await axios.delete(`/vehicules/${id}`);
      fetchVehicules();
    }
  };

  const renderFileAvatar = (file?: string) => {
    if (!file) return 'N/A';
    const url = `http://localhost:5000/uploads/vehicules/${file}`;
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
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Rechercher"
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
            sx={{ width: '30%' }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Ajouter Véhicule
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {['Nom', 'Chauffeur', 'Matricule', 'Type', 'Km', 'CT', 'Assurance', 'Carte Grise', 'Actions'].map(h => (
                  <TableCell key={h}><strong>{h}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{v.chauffeur}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage.toLocaleString()}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderFileAvatar(v.assuranceFile)}</TableCell>
                  <TableCell>{renderFileAvatar(v.carteGriseFile)}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(v)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(v._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filtered.length / perPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box mt={8} p={3} width={400} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" mb={2}>{isEditing ? 'Modifier Véhicule' : 'Ajouter Véhicule'}</Typography>
            <TextField label="Nom du véhicule" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Chauffeur</InputLabel>
              <Select
                value={form.chauffeur}
                label="Chauffeur"
                onChange={(e) => handleChange('chauffeur', e.target.value)}
              >
                {chauffeurs.map(c => (
                  <MenuItem key={c._id} value={`${c.nom} ${c.prenom}`}>{c.nom} {c.prenom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Matricule" value={form.matricule} onChange={(e) => handleChange('matricule', e.target.value)} fullWidth margin="normal" />
            <TextField label="Type" value={form.type} onChange={(e) => handleChange('type', e.target.value)} fullWidth margin="normal" />
            <TextField label="Kilométrage" type="number" value={form.kilometrage} onChange={(e) => handleChange('kilometrage', +e.target.value)} fullWidth margin="normal" />
            <TextField label="Contrôle Technique" type="date" InputLabelProps={{ shrink: true }} value={form.controle_technique} onChange={(e) => handleChange('controle_technique', e.target.value)} fullWidth margin="normal" />
            <Box mt={2} width="100%">
              <Typography mb={1}>Assurance (PDF ou image)</Typography>
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setAssuranceFile(e.target.files?.[0] || null)} />
            </Box>
            <Box mt={2} width="100%">
              <Typography mb={1}>Carte Grise (PDF ou image)</Typography>
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setCarteGriseFile(e.target.files?.[0] || null)} />
            </Box>
            <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSave}>Enregistrer</Button>
          </Box>
        </Drawer>

        <Dialog open={!!previewFileUrl} onClose={() => setPreviewFileUrl(null)} maxWidth="lg">
          <Box position="relative" p={2}>
            <IconButton
              onClick={() => {
                const filename = previewFileUrl?.split('/').pop();
                const link = document.createElement('a');
                link.href = previewFileUrl!;
                link.setAttribute('download', filename || 'document');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              sx={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#fff' }}
            >
              <Download />
            </IconButton>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
              {previewFileUrl?.endsWith('.pdf') ? (
                <iframe src={previewFileUrl} width="90%" height="600px" style={{ border: 'none' }} />
              ) : (
                <img src={previewFileUrl!} alt="Aperçu" style={{ maxWidth: '90vw', maxHeight: '90vh' }} />
              )}
            </Box>
          </Box>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
