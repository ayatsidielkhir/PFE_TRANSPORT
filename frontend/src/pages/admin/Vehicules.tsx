import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, IconButton, Tooltip,
  InputAdornment, Typography, Avatar, Pagination, Dialog, DialogTitle, DialogContent,
  Drawer, MenuItem, Select, FormControl, InputLabel, useMediaQuery
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, PictureAsPdf, Add, DriveEta } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
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

const fileFields = [
  'assurance',
  'carteGrise',
  'vignette',
  'agrement',
  'carteVerte',
  'extincteur',
  'photoVehicule'
] as const;
type FileField = typeof fileFields[number];

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [form, setForm] = useState<Partial<Vehicule & { photoVehicule?: File }>>({});
  const [openDocsDialog, setOpenDocsDialog] = useState(false);
  const [docsVehicule, setDocsVehicule] = useState<Vehicule | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    if (/\.(png|jpg|jpeg)$/i.test(file)) {
      return <Avatar variant="rounded" src={url} sx={{ width: 40, height: 50, cursor: 'pointer' }} onClick={() => window.open(url)} />;
    }
    if (/\.pdf$/i.test(file)) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url)}>
            <PictureAsPdf color="error" />
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
      <Box p={3} maxWidth="1400px" mx="auto">
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
            <DriveEta /> Gestion des Véhicules
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
              onClick={handleAddVehicule}
            >
              Ajouter un véhicule
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Matricule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Kilométrage</TableCell>
                <TableCell>CT</TableCell>
                <TableCell>Carte Grise</TableCell>
                <TableCell>Assurance</TableCell>
                <TableCell>Docs</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(v => (
                <TableRow key={v._id}>
                  <TableCell>{renderDocument(v.photo)}</TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderDocument(v.carteGrise)}</TableCell>
                  <TableCell>{renderDocument(v.assurance)}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => { setDocsVehicule(v); setOpenDocsDialog(true); }}>Voir</Button>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(v)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton sx={{ color: '#d32f2f' }}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filtered.length / perPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Paper>

        {/* Drawer stylisé */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={isMobile ? '100vw' : 450}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              {selectedVehicule ? 'Modifier un véhicule' : 'Ajouter un véhicule'}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              {['nom', 'matricule', 'type', 'kilometrage', 'controle_technique'].map(field => (
                <Box key={field} flex="1 1 45%">
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={form[field as keyof Vehicule] || ''}
                    onChange={(e) => handleChange(field as keyof Vehicule, e.target.value)}
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
              >
                {chauffeurs.map(c => (
                  <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {fileFields.map((field: FileField) => (
                <Box key={field} flex="1 1 45%">
                  <Typography fontWeight={500} mb={0.5}>{field}</Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: '12px', backgroundColor: '#ffffff', textTransform: 'none', fontSize: '14px', py: 1 }}
                  >
                    {form[field] instanceof File ? (form[field] as File).name : 'Choisir un fichier'}
                    <input
                      type="file"
                      name={field}
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleChange(field, file);
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
              sx={{
                mt: 4,
                backgroundColor: '#001e61',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '16px',
                '&:hover': { backgroundColor: '#001447' }
              }}
            >
              {selectedVehicule ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>

        <Dialog open={openDocsDialog} onClose={() => setOpenDocsDialog(false)} maxWidth="md">
          <DialogTitle>Autres documents</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
              {[
                { label: 'Vignette', file: docsVehicule?.vignette },
                { label: 'Agrément', file: docsVehicule?.agrement },
                { label: 'Carte Verte', file: docsVehicule?.carteVerte },
                { label: 'Extincteur', file: docsVehicule?.extincteur }
              ].map(({ label, file }) => (
                <Box key={label} width={130} textAlign="center">
                  <Typography fontSize={14} fontWeight="bold" mb={1}>{label}</Typography>
                  {renderDocument(file)}
                </Box>
              ))}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
