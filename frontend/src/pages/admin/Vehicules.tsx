import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Drawer, InputAdornment, Avatar, Typography, Select, MenuItem,
  FormControl, InputLabel, Pagination
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import { useMediaQuery } from '@mui/material';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';



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
  chauffeur?: string;
  photoVehicule?: string;
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
  const [vignetteFile, setVignetteFile] = useState<File | null>(null);
  const [agrementFile, setAgrementFile] = useState<File | null>(null);
  const [carteVerteFile, setCarteVerteFile] = useState<File | null>(null);
  const [extincteurFile, setExtincteurFile] = useState<File | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const isMobile = useMediaQuery('(max-width:600px)');
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [photoVehiculeFile, setPhotoVehiculeFile] = useState<File | null>(null);
  const [previewPhotoVehicule, setPreviewPhotoVehicule] = useState<string | null>(null);




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
    setForm({ nom: '', matricule: '', type: '', kilometrage: 0, controle_technique: '', chauffeur: '' });
    setAssuranceFile(null);
    setCarteGriseFile(null);
    setVignetteFile(null);
    setAgrementFile(null);
    setCarteVerteFile(null);
    setExtincteurFile(null);
    setIsEditing(false);
    setDrawerOpen(true);
    setPhotoVehiculeFile(null);
    setPreviewPhotoVehicule(null);

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
    setPhotoVehiculeFile(null);
    setPreviewPhotoVehicule(null);

  };

  const handleSave = async () => {
    if (!form.nom || !form.matricule || !form.type || !form.kilometrage || !form.controle_technique) {
      alert("Merci de remplir tous les champs obligatoires.");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (assuranceFile) formData.append('assurance', assuranceFile);
    if (carteGriseFile) formData.append('carteGrise', carteGriseFile);
    if (vignetteFile) formData.append('vignette', vignetteFile);
    if (agrementFile) formData.append('agrement', agrementFile);
    if (carteVerteFile) formData.append('carteVerte', carteVerteFile);
    if (extincteurFile) formData.append('extincteur', extincteurFile);
    if (photoVehiculeFile) formData.append('photoVehicule', photoVehiculeFile);


    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/vehicules/${form._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await axios.post('/api/vehicules', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      if ([200, 201].includes(res.status)) {
        fetchVehicules();
        setDrawerOpen(false);
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
      console.error(err);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Supprimer ce véhicule ?')) {
      try {
        await axios.delete(`/api/vehicules/${id}`);
        fetchVehicules();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderFileAvatar = (file?: string) => {
  if (!file) return 'N/A';
  const url = `https://mme-backend.onrender.com/uploads/vehicules/${file}`;
  return (
    <Tooltip title="Voir le PDF">
      <IconButton onClick={() => setModalUrl(url)}>
        <PictureAsPdf sx={{ fontSize: 32, color: 'red' }} />
      </IconButton>
    </Tooltip>
  );
};



  const filtered = vehicules.filter(v =>
    v.nom?.toLowerCase().includes(search.toLowerCase()) ||
    v.matricule?.toLowerCase().includes(search.toLowerCase())
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
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
            Ajouter Véhicule
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                {['Photo','Nom', 'Chauffeur', 'Matricule', 'Type', 'Km', 'CT', 'Assurance', 'Carte Grise', 'Vignette', 'Agrément', 'Carte Verte', 'Extincteur', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#2D2D90' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>
                    {v.photoVehicule ? (
                      <Avatar
                        src={`https://mme-backend.onrender.com/uploads/vehicules/${v.photoVehicule}`}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{chauffeurs.find(c => c._id === v.chauffeur)?.nom || '—'}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
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
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
        </Box>

        {/* Drawer */}
  <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  <Box p={3} width={isMobile ? '100vw' : 450}>
    <Box display="flex" justifyContent="center" mb={3}>
      <label htmlFor="photoVehicule-input">
        <Avatar
            src={
              previewPhotoVehicule
                || (form.photoVehicule
                    ? `https://mme-backend.onrender.com/uploads/vehicules/${form.photoVehicule}`
                    : '')
            }
            sx={{
              width: 110,
              height: 110,
              cursor: 'pointer',
              borderRadius: '12px',
              boxShadow: 2,
              backgroundColor: '#f0f0f0',
              mt: 1
            }}
          />

      </label>
          <input
            id="photoVehicule-input"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                setPhotoVehiculeFile(file);
                setPreviewPhotoVehicule(URL.createObjectURL(file));
              }
            }}
          />

    </Box>

    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
      {[{ name: 'nom', label: 'Nom' }, { name: 'matricule', label: 'Matricule' }, { name: 'type', label: 'Type' }, { name: 'kilometrage', label: 'Kilométrage', type: 'number' }, { name: 'controle_technique', label: 'Contrôle Technique' }].map(
        ({ name, label, type }) => (
          <Box key={name} flex="1 1 45%">
            <TextField
              fullWidth
              label={label}
              type={type || 'text'}
              name={name}
              value={form[name as keyof Vehicule] as string | number}
              onChange={(e) => handleChange(name as keyof Vehicule, e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f9fafb'
                }
              }}
            />
          </Box>
        )
      )}
    </Box>

    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Chauffeur</InputLabel>
      <Select
        value={form.chauffeur || ''}
        onChange={(e) => handleChange('chauffeur', e.target.value)}
        label="Chauffeur"
        sx={{ borderRadius: '12px', backgroundColor: '#f9fafb' }}
      >
        {chauffeurs.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.nom} {c.prenom}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <Box display="flex" flexWrap="wrap" gap={2}>
      {[
        { name: 'assurance', label: 'Assurance', file: assuranceFile, setter: setAssuranceFile },
        { name: 'carteGrise', label: 'Carte Grise', file: carteGriseFile, setter: setCarteGriseFile },
        { name: 'vignette', label: 'Vignette', file: vignetteFile, setter: setVignetteFile },
        { name: 'agrement', label: 'Agrément', file: agrementFile, setter: setAgrementFile },
        { name: 'carteVerte', label: 'Carte Verte', file: carteVerteFile, setter: setCarteVerteFile },
        { name: 'extincteur', label: 'Extincteur', file: extincteurFile, setter: setExtincteurFile }
      ].map(({ name, label, file, setter }) => (
        <Box key={name} flex="1 1 45%">
          <Typography fontWeight={500} mb={0.5}>{label}</Typography>
          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              textTransform: 'none',
              fontSize: '14px',
              py: 1
            }}
          >
            {file ? file.name : 'Choisir un fichier PDF'}
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={(e) => setter(e.target.files?.[0] || null)}
            />
          </Button>
        </Box>
      ))}
    </Box>

    <Button
      fullWidth
      variant="contained"
      onClick={handleSave}
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
      {isEditing ? 'Enregistrer les modifications' : 'Ajouter Véhicule'}
    </Button>
  </Box>
</Drawer>

<Dialog open={!!modalUrl} onClose={() => setModalUrl(null)} maxWidth="lg" fullWidth>
  <DialogTitle>Visualisation PDF</DialogTitle>
  <DialogContent>
    <iframe src={modalUrl || ''} width="100%" height="600px" style={{ border: 'none' }} />
    <Box mt={2} textAlign="right">
      <Button onClick={() => window.open(modalUrl || '', '_blank')} variant="outlined">Télécharger</Button>
    </Box>
  </DialogContent>
</Dialog>



      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
