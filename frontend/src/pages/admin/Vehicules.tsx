// ✅ Fichier complet VehiculesPage.tsx avec image du véhicule + docs limités + popup docs restants

import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Avatar, Typography, Dialog, Pagination
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';

interface Vehicule {
  _id?: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  controle_technique: string;
  assurance?: string;
  carteGrise?: string;
  vignette?: string;
  agrement?: string;
  carteVerte?: string;
  extincteur?: string;
  photoVehicule?: string;
  chauffeur?: string;
}

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Vehicule>({ nom: '', matricule: '', type: '', kilometrage: 0, controle_technique: '' });

  const [photoVehiculeFile, setPhotoVehiculeFile] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const [assuranceFile, setAssuranceFile] = useState<File | null>(null);
  const [carteGriseFile, setCarteGriseFile] = useState<File | null>(null);
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);
  const [agrementFile, setAgrementFile] = useState<File | null>(null);
  const [carteVerteFile, setCarteVerteFile] = useState<File | null>(null);
  const [extincteurFile, setExtincteurFile] = useState<File | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Vehicule | null>(null);

  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchVehicules();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('/api/vehicules');
    setVehicules(res.data);
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = () => {
    setForm({ nom: '', matricule: '', type: '', kilometrage: 0, controle_technique: '' });
    setPhotoVehiculeFile(null);
    setPreviewPhotoUrl(null);
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
    setForm(vehicule);
    setPreviewPhotoUrl(vehicule.photoVehicule ? `https://mme-backend.onrender.com/uploads/vehicules/${vehicule.photoVehicule}` : null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (photoVehiculeFile) formData.append('photoVehicule', photoVehiculeFile);
    if (assuranceFile) formData.append('assurance', assuranceFile);
    if (carteGriseFile) formData.append('carteGrise', carteGriseFile);
    if (vignetteFile) formData.append('vignette', vignetteFile);
    if (agrementFile) formData.append('agrement', agrementFile);
    if (carteVerteFile) formData.append('carteVerte', carteVerteFile);
    if (extincteurFile) formData.append('extincteur', extincteurFile);

    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/vehicules/${form._id}`, formData)
        : await axios.post('/api/vehicules', formData);
      if ([200, 201].includes(res.status)) {
        fetchVehicules();
        setDrawerOpen(false);
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Supprimer ce véhicule ?')) {
      await axios.delete(`/api/vehicules/${id}`);
      fetchVehicules();
    }
  };

  const renderFileAvatar = (file?: string) => {
    if (!file) return 'N/A';
    const url = `https://mme-backend.onrender.com/uploads/vehicules/${file}`;
    const isPdf = file.endsWith('.pdf');
    return (
      <Avatar
        src={isPdf ? '/pdf-icon.png' : url}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => window.open(url, '_blank')}
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
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Rechercher..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Ajouter Véhicule</Button>
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Matricule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Km</TableCell>
                <TableCell>CT</TableCell>
                <TableCell>Assurance</TableCell>
                <TableCell>Carte Grise</TableCell>
                <TableCell>Vignette</TableCell>
                <TableCell>Docs</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(v => (
                <TableRow key={v._id}>
                  <TableCell>
                    {v.photoVehicule ? (
                      <Avatar variant="rounded" src={`https://mme-backend.onrender.com/uploads/vehicules/${v.photoVehicule}`} sx={{ width: 60, height: 60 }} />
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderFileAvatar(v.assurance)}</TableCell>
                  <TableCell>{renderFileAvatar(v.carteGrise)}</TableCell>
                  <TableCell>{renderFileAvatar(v.vignette)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => setSelectedDocs(v)}>...</IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(v)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(v._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />

        {/* Pop-up Docs */}
        <Dialog open={!!selectedDocs} onClose={() => setSelectedDocs(null)}>
          <Box p={3}>
            <Typography variant="h6" mb={2}>Autres Documents</Typography>
            {['agrement', 'carteVerte', 'extincteur'].map((key) => {
              const file = selectedDocs?.[key as keyof Vehicule] as string;
              return file ? (
                <Box key={key} display="flex" alignItems="center" mb={1}>
                  <Typography sx={{ width: 130 }}>{key} :</Typography>
                  {renderFileAvatar(file)}
                </Box>
              ) : null;
            })}
            <Button fullWidth onClick={() => setSelectedDocs(null)} sx={{ mt: 2 }}>Fermer</Button>
          </Box>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
