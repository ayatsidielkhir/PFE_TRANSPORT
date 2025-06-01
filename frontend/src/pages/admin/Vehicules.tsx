import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Typography, MenuItem, Select,
  FormControl, InputLabel, Pagination, Avatar
} from '@mui/material';
import { Add, Delete, Edit, Search as SearchIcon, PictureAsPdf } from '@mui/icons-material';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Vehicule>({
    nom: '', matricule: '', type: '', kilometrage: 0,
    controle_technique: '', chauffeur: '', assurance: '', carteGrise: ''
  });
  const [chauffeurMap, setChauffeurMap] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
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
    const map: Record<string, string> = {};
    res.data.forEach((c: Chauffeur) => {
      if (c._id) map[c._id] = `${c.nom} ${c.prenom}`;
    });
    setChauffeurMap(map);
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = () => {
    setForm({
      nom: '', matricule: '', type: '', kilometrage: 0,
      controle_technique: '', chauffeur: '', assurance: '', carteGrise: ''
    });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setForm({ ...vehicule });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        formData.append(key, value.toString());
      }
    });

    const fileFields = [
      'carteGrise', 'assurance', 'vignette',
      'agrement', 'carteVerte', 'extincteur', 'photoVehicule'
    ];

    fileFields.forEach((field) => {
      const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement;
      if (input?.files?.length) {
        const file = input.files[0];
        if (file && file.name) {
          formData.append(field, file);
        }
      }
    });

    try {
      const url = isEditing && form._id ? `/api/vehicules/${form._id}` : `/api/vehicules`;
      const method = isEditing ? axios.put : axios.post;

      await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await fetchVehicules();
      setDrawerOpen(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement du véhicule.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      await axios.delete(`/api/vehicules/${id}`);
      fetchVehicules();
    }
  };

  const renderVehiculePhoto = (file?: string) => {
    if (!file) return '—';
    const url = `${BACKEND_URL}/uploads/vehicules/${file}`;
    return (
      <Avatar
        src={url}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => window.open(url, '_blank')}
      />
    );
  };

  const renderDocument = (file?: string) => {
    if (!file) return '—';
    const url = `${BACKEND_URL}/uploads/vehicules/${file}`;
    const isImage = /\.(png|jpg|jpeg)$/i.test(file);
    const isPDF = /\.pdf$/i.test(file);

    if (isImage) {
      return (
        <Avatar
          src={url}
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => window.open(url, '_blank')}
        />
      );
    } else if (isPDF) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url, '_blank')}>
            <PictureAsPdf color="error" />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        📎 Fichier
      </a>
    );
  };

  const filtered = vehicules.filter(v =>
    (v.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (v.matricule?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const cellStyle = { fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' };

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Gestion des Véhicules
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Rechercher un véhicule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: '35%', backgroundColor: 'white', borderRadius: 1 }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: '#001e61',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              boxShadow: 2,
              '&:hover': { backgroundColor: '#001447' }
            }}
            onClick={handleAdd}
          >
            Ajouter un véhicule
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={cellStyle}>Image</TableCell>
                <TableCell sx={cellStyle}>Nom</TableCell>
                <TableCell sx={cellStyle}>Chauffeur</TableCell>
                <TableCell sx={cellStyle}>Matricule</TableCell>
                <TableCell sx={cellStyle}>Type</TableCell>
                <TableCell sx={cellStyle}>Km</TableCell>
                <TableCell sx={cellStyle}>CT</TableCell>
                <TableCell sx={cellStyle}>Carte Grise</TableCell>
                <TableCell sx={cellStyle}>Assurance</TableCell>
                <TableCell sx={cellStyle}>Vignette</TableCell>
                <TableCell sx={cellStyle}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{renderVehiculePhoto(v.photo)}</TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{chauffeurMap[v.chauffeur || ''] || '—'}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderDocument(v.carteGrise)}</TableCell>
                  <TableCell>{renderDocument(v.assurance)}</TableCell>
                  <TableCell>{renderDocument(v.vignette)}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(v)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(v._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={2}>{isEditing ? 'Modifier' : 'Ajouter'} Véhicule</Typography>
            <TextField fullWidth label="Nom" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} margin="normal" />
            <TextField fullWidth label="Matricule" value={form.matricule} onChange={(e) => handleChange('matricule', e.target.value)} margin="normal" />
            <TextField fullWidth label="Type" value={form.type} onChange={(e) => handleChange('type', e.target.value)} margin="normal" />
            <TextField fullWidth label="Kilométrage" type="number" value={form.kilometrage} onChange={(e) => handleChange('kilometrage', parseFloat(e.target.value))} margin="normal" />
            <TextField fullWidth label="Contrôle technique" value={form.controle_technique} onChange={(e) => handleChange('controle_technique', e.target.value)} margin="normal" />

            <FormControl fullWidth margin="normal">
              <InputLabel>Chauffeur</InputLabel>
              <Select
                value={form.chauffeur || ''}
                onChange={(e) => handleChange('chauffeur', e.target.value)}
                label="Chauffeur"
              >
                {chauffeurs.map(c => (
                  <MenuItem key={c._id} value={c._id}>{`${c.nom} ${c.prenom}`}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {["carteGrise", "assurance", "vignette", "agrement", "carteVerte", "extincteur", "photoVehicule"].map(field => (
              <Box key={field} my={1}>
                <Typography variant="body2">{field}</Typography>
                <input type="file" name={field} />
              </Box>
            ))}

            <Button fullWidth variant="contained" onClick={handleSave} sx={{ backgroundColor: '#001e61', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}>
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
