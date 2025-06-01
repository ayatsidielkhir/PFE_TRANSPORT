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
  const [form, setForm] = useState<Partial<Vehicule>>({});
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
      if (value !== undefined) formData.append(key, value as string);
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

  const renderVoirPlus = (vehicule: Vehicule) => {
    const otherDocs = [vehicule.agrement, vehicule.carteVerte, vehicule.extincteur];
    const hasDocs = otherDocs.some(doc => doc);
    if (!hasDocs) return '—';
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setSelectedVehiculeDocs(vehicule);
          setDialogOpen(true);
        }}
      >
        ...
      </Button>
    );
  };

  const chauffeurMap = chauffeurs.reduce((acc, ch) => {
    acc[ch._id] = `${ch.nom} ${ch.prenom}`;
    return acc;
  }, {} as Record<string, string>);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      await axios.delete(`/api/vehicules/${id}`);
      fetchVehicules();
    }
  };

  const filtered = vehicules.filter(v =>
    v.nom?.toLowerCase().includes(search.toLowerCase()) ||
    v.matricule?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);


  const handleChange = (field: keyof Vehicule, value: any) => {
  setForm((prev) => ({ ...prev, [field]: value }));
};

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
            onClick={handleAddVehicule}
          >
            Ajouter un véhicule
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Photo', 'Nom', 'Chauffeur', 'Matricule', 'Type', 'Km', 'CT', 'Carte Grise', 'Assurance', 'Vignette', 'Autres Docs', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{renderDocument(v.photo)}</TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{chauffeurMap[v.chauffeur || ''] || '—'}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderDocument(v.carteGrise)}</TableCell>
                  <TableCell>{renderDocument(v.assurance)}</TableCell>
                  <TableCell>{renderDocument(v.vignette)}</TableCell>
                  <TableCell>{renderVoirPlus(v)}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(v)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(v._id)}><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filtered.length / perPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Documents supplémentaires</DialogTitle>
          <DialogContent>
            {selectedVehiculeDocs && (
              <>
                {selectedVehiculeDocs.agrement && (
                  <Box mb={2}>
                    <Typography fontWeight={500}>Agrément</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.agrement}`} target="_blank">{selectedVehiculeDocs.agrement}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.carteVerte && (
                  <Box mb={2}>
                    <Typography fontWeight={500}>Carte Verte</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.carteVerte}`} target="_blank">{selectedVehiculeDocs.carteVerte}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.extincteur && (
                  <Box mb={2}>
                    <Typography fontWeight={500}>Extincteur</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.extincteur}`} target="_blank">{selectedVehiculeDocs.extincteur}</a>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {selectedVehicule ? 'Modifier un véhicule' : 'Ajouter un véhicule'}
            </Typography>
            {(['nom', 'matricule', 'type', 'kilometrage', 'controle_technique'] as (keyof Vehicule)[]).map((field) => (
              <TextField
                key={field}
                fullWidth
                label={field}
                name={field}
                value={form[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
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
            {['assurance', 'carteGrise', 'vignette', 'agrement', 'carteVerte', 'extincteur', 'photo'].map(field => (
              <Box key={field} mb={2}>
                <Typography>{field}</Typography>
                <input
                  name={field}
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, [field]: file });
                  }}
                />
              </Box>
            ))}
            <Button fullWidth variant="contained" onClick={handleSubmit}>
              {selectedVehicule ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
