import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Typography, InputAdornment, Paper, useMediaQuery,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, PictureAsPdf, DriveEta, Add } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';

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

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchVehicules = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/vehicules');
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/chauffeurs');
    setChauffeurs(res.data);
  };

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const handleChange = (field: keyof Vehicule, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setForm(vehicule);
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce véhicule ?')) return;
    await axios.delete(`https://mme-backend.onrender.com/api/vehicules/${id}`);
    fetchVehicules();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const url = selectedVehicule
      ? `https://mme-backend.onrender.com/api/vehicules/${selectedVehicule._id}`
      : `https://mme-backend.onrender.com/api/vehicules`;
    const method = selectedVehicule ? axios.put : axios.post;

    try {
      await method(url, formData);
      fetchVehicules();
      setDrawerOpen(false);
      setForm({});
      setSelectedVehicule(null);
      setPreviewPhoto(null);
    } catch (err) {
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const renderDocumentAvatar = (file: string | undefined) => {
    if (!file || typeof file !== 'string') return '—';
    const url = `https://mme-backend.onrender.com/uploads/vehicules/${file}`;
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      return <Avatar variant="rounded" src={url} sx={{ width: 35, height: 45 }} />;
    } else if (/\.pdf$/i.test(file)) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url)} sx={{ color: '#d32f2f' }}>
            <PictureAsPdf />
          </IconButton>
        </Tooltip>
      );
    }
    return '—';
  };

  const filtered = vehicules.filter(v =>
    v.nom?.toLowerCase().includes(search.toLowerCase()) ||
    v.matricule?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={isMobile ? 1 : 2}>
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
            <DriveEta sx={{ width: 35, height: 32 }} />
            Gestion des Véhicules
          </Typography>

          <Box display={isMobile ? 'block' : 'flex'} justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              size="small"
              placeholder="Rechercher un véhicule..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: isMobile ? '100%' : '35%', backgroundColor: 'white', borderRadius: 1, mb: isMobile ? 2 : 0 }}
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
                '&:hover': { backgroundColor: '#001447' },
                width: isMobile ? '100%' : 'auto'
              }}
              onClick={() => { setDrawerOpen(true); setForm({}); setSelectedVehicule(null); setPreviewPhoto(null); }}
            >
              Ajouter un véhicule
            </Button>
          </Box>

          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  {['Photo', 'Nom', 'Matricule', 'Type', 'KM', 'Contrôle', 'Assurance', 'Carte Grise', 'Autres', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((v, i) => (
                  <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                    <TableCell><Avatar src={`https://mme-backend.onrender.com/uploads/vehicules/${v.photoVehicule}`} sx={{ width: 45, height: 45, borderRadius: '12px' }} /></TableCell>
                    <TableCell>{v.nom}</TableCell>
                    <TableCell>{v.matricule}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>{v.kilometrage}</TableCell>
                    <TableCell>{v.controle_technique}</TableCell>
                    <TableCell>{renderDocumentAvatar(v.assurance)}</TableCell>
                    <TableCell>{renderDocumentAvatar(v.carteGrise)}</TableCell>
                    <TableCell>
                      {[v.vignette, v.agrement, v.carteVerte, v.extincteur]
                        .filter(f => typeof f === 'string' && f)
                        .map((f, idx) => (
                          <Box key={idx} display="inline-block" mr={0.5}>
                            {renderDocumentAvatar(f)}
                          </Box>
                        ))}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modifier"><IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(v)}><Edit /></IconButton></Tooltip>
                      <Tooltip title="Supprimer"><IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(v._id!)}><Delete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
          </Box>
        </Paper>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={isMobile ? '100vw' : 450}>
            <Box display="flex" justifyContent="center" mb={3}>
              <label htmlFor="photoVehicule-input">
                <Avatar
                  src={previewPhoto || ''}
                  sx={{ width: 110, height: 110, cursor: 'pointer', borderRadius: '12px', boxShadow: 2, backgroundColor: '#f0f0f0', mt: 1 }}
                />
              </label>
              <input
                id="photoVehicule-input"
                name="photoVehicule"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPreviewPhoto(URL.createObjectURL(file));
                    handleChange('photoVehicule', file);
                  }
                }}
              />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              {['nom', 'matricule', 'type', 'kilometrage', 'controle_technique'].map(field => (
                <Box key={field} flex="1 1 45%">
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                    name={field}
                    value={form[field] || ''}
                    onChange={(e) => handleChange(field as keyof Vehicule, e.target.value)}
                    type={field === 'kilometrage' ? 'number' : 'text'}
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', backgroundColor: '#f9fafb' } }}
                  />
                </Box>
              ))}
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Chauffeur</InputLabel>
              <Select
                value={form.chauffeur || ''}
                onChange={e => setForm({ ...form, chauffeur: e.target.value })}
                label="Chauffeur"
                sx={{ borderRadius: '12px', backgroundColor: '#f9fafb' }}
              >
                {chauffeurs.map(c => (
                  <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {['assurance', 'carteGrise', 'vignette', 'agrement', 'carteVerte', 'extincteur'].map(field => (
                <Box key={field} flex="1 1 45%">
                  <Typography fontWeight={500} mb={0.5}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: '12px', backgroundColor: '#ffffff', textTransform: 'none', fontSize: '14px', py: 1 }}
                  >
                    {form[field] instanceof File ? form[field].name : 'Choisir un fichier'}
                    <input
                      type="file"
                      name={field}
                      hidden
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleChange(field as keyof Vehicule, file);
                      }}
                    />
                  </Button>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 4, backgroundColor: '#001e61', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', py: 1.5, fontSize: '16px', '&:hover': { backgroundColor: '#001447' } }}
            >
              {selectedVehicule ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
