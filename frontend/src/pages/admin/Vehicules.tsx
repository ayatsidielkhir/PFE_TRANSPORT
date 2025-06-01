import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Typography, MenuItem, Select,
  FormControl, InputLabel, Pagination, Avatar, Dialog
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehiculeDocs, setSelectedVehiculeDocs] = useState<Vehicule | null>(null);
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
      if (value !== undefined && typeof value !== 'object') {
        formData.append(key, value.toString());
      }
    });
    const fileFields = ["carteGrise", "assurance", "vignette", "agrement", "carteVerte", "extincteur", "photoVehicule"];
    fileFields.forEach((field) => {
      const input = document.querySelector(`input[name="${field}"]`) as HTMLInputElement;
      if (input?.files?.length) {
        const file = input.files[0];
        formData.append(field, file);
      }
    });
    try {
      const url = isEditing && form._id ? `/api/vehicules/${form._id}` : `/api/vehicules`;
      const method = isEditing ? axios.put : axios.post;
      await method(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchVehicules();
      setDrawerOpen(false);
    } catch {
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

  const filtered = vehicules.filter(v =>
    v.nom?.toLowerCase().includes(search.toLowerCase()) ||
    v.matricule?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Ajouter</Button>
        </Box>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Chauffeur</TableCell>
                <TableCell>Matricule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Km</TableCell>
                <TableCell>CT</TableCell>
                <TableCell>Carte Grise</TableCell>
                <TableCell>Assurance</TableCell>
                <TableCell>Vignette</TableCell>
                <TableCell>Autres Docs</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(v => (
                <TableRow key={v._id}>
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
                    <IconButton onClick={() => handleEdit(v)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(v._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, v) => setPage(v)} />

        {/* Dialog pour afficher les autres documents */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <Box p={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Documents supplémentaires</Typography>
            {selectedVehiculeDocs && (
              <>
                {selectedVehiculeDocs.agrement && (
                  <Box mb={2}>
                    <Typography>Agrément</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.agrement}`} target="_blank">{selectedVehiculeDocs.agrement}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.carteVerte && (
                  <Box mb={2}>
                    <Typography>Carte Verte</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.carteVerte}`} target="_blank">{selectedVehiculeDocs.carteVerte}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.extincteur && (
                  <Box mb={2}>
                    <Typography>Extincteur</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.extincteur}`} target="_blank">{selectedVehiculeDocs.extincteur}</a>
                  </Box>
                )}
              </>
            )}
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={() => setDialogOpen(false)} variant="contained">Fermer</Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
