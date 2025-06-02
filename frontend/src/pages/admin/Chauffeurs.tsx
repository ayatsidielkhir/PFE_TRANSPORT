// ✅ Page Chauffeurs avec style moderne, Drawer amélioré, responsive mobile et meilleure UI

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper, useMediaQuery
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, PictureAsPdf, Add, DriveEta } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';
import { Person } from '@mui/icons-material';

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  adresse?: string;
  photo?: string;
  scanCIN?: string;
  scanPermis?: string;
  scanVisa?: string;
  certificatBonneConduite?: string;
}

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<Record<string, string | Blob | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

  const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  const renderDocumentAvatar = (file: string | undefined) => {
  if (!file) return '—';
  const url = `https://mme-backend.onrender.com/uploads/chauffeurs/${file}`;
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
    return (
      <Avatar
        variant="rounded"
        src={url}
        sx={{ width: 35, height: 45, cursor: 'pointer', border: '1px solid #ccc' }}
        onClick={() => { setDialogImageSrc(url); setOpenDialog(true); }}
      />
    );
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


  const fetchChauffeurs = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/chauffeurs');
    setChauffeurs(res.data);
  };

  useEffect(() => { fetchChauffeurs(); }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (name === 'photo') setPreviewPhoto(URL.createObjectURL(file));
      setForm(prev => ({ ...prev, [name]: file }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.cin) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const url = selectedChauffeur
      ? `https://mme-backend.onrender.com/api/chauffeurs/${selectedChauffeur._id}`
      : `https://mme-backend.onrender.com/api/chauffeurs`;

    const method = selectedChauffeur ? axios.put : axios.post;

    try {
      await method(url, formData);
      fetchChauffeurs();
      resetForm();
      setDrawerOpen(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setForm({
      nom: chauffeur.nom,
      prenom: chauffeur.prenom,
      telephone: chauffeur.telephone,
      cin: chauffeur.cin,
      adresse: chauffeur.adresse || '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce chauffeur ?")) return;
    await axios.delete(`https://mme-backend.onrender.com/api/chauffeurs/${id}`);
    fetchChauffeurs();
  };

  const resetForm = () => {
    setForm({
      nom: '', prenom: '', telephone: '', cin: '', adresse: '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });
    setSelectedChauffeur(null);
    setPreviewPhoto(null);
  };

  const filtered = chauffeurs.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={isMobile ? 1 : 2} sx={{ minHeight: '100vh' }}>
        <Box maxWidth="1400px" mx="auto">
          <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
              <Person sx={{ width: 35, height: 32 }} />
               Gestion des Chauffeurs
            </Typography>

            <Box display={isMobile ? 'block' : 'flex'} justifyContent="space-between" alignItems="center" mb={2}>
              <TextField
                size="small"
                placeholder="Rechercher un chauffeur..."
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
                onClick={() => { setDrawerOpen(true); resetForm(); }}
              >
                Ajouter un chauffeur
              </Button>
            </Box>

            {/* ✅ Tableau également visible sur mobile */}
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  {['Photo', 'Nom', 'Prénom', 'Téléphone', 'CIN', 'Adresse', 'CIN', 'Permis', 'Visa', 'Certificat', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((c, i) => (
                  <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell><Avatar src={`https://mme-backend.onrender.com/uploads/chauffeurs/${c.photo}`} sx={{ width: 45, height: 45, borderRadius: '50%' }} /></TableCell>
                    <TableCell>{c.nom}</TableCell>
                    <TableCell>{c.prenom}</TableCell>
                    <TableCell>{c.telephone}</TableCell>
                    <TableCell>{c.cin}</TableCell>
                    <TableCell>{c.adresse}</TableCell>
                    <TableCell>{renderDocumentAvatar(c.scanCIN)}</TableCell>
                    <TableCell>{renderDocumentAvatar(c.scanPermis)}</TableCell>
                    <TableCell>{renderDocumentAvatar(c.scanVisa)}</TableCell>
                    <TableCell>{renderDocumentAvatar(c.certificatBonneConduite)}</TableCell>
                    <TableCell>
                      <Tooltip title="Modifier"><IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                      <Tooltip title="Supprimer"><IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
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
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
          <DialogTitle sx={{ mt: 2 }}>Visualiser le document</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            <Box component="img" src={dialogImageSrc} alt="document" width="100%" />
          </DialogContent>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={isMobile ? '100vw' : 450}>
            <Box display="flex" justifyContent="center" mb={3}>
              <label htmlFor="photo-input">
                <Avatar
                  src={previewPhoto || ''}
                  sx={{ width: 110, height: 110, cursor: 'pointer', borderRadius: '50%', boxShadow: 2, backgroundColor: '#f0f0f0',marginTop:10 }}
                />
              </label>
              <input id="photo-input" name="photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleInputChange} />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              {['nom', 'prenom', 'telephone', 'cin', 'adresse'].map(field => (
                <Box key={field} flex="1 1 45%">
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={form[field] as string}
                    onChange={handleInputChange}
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', backgroundColor: '#f9fafb' } }}
                  />
                </Box>
              ))}
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              {['scanCIN', 'scanPermis', 'scanVisa', 'certificatBonneConduite'].map(field => (
                <Box key={field} flex="1 1 45%">
                  <Typography fontWeight={500} mb={0.5}>{field}</Typography>
                  <Button component="label" variant="outlined" fullWidth sx={{ borderRadius: '12px', backgroundColor: '#ffffff', textTransform: 'none', fontSize: '14px', py: 1 }}>
                    {form[field] instanceof File ? (form[field] as File).name : 'Choisir un fichier'}
                    <input type="file" name={field} hidden onChange={handleInputChange} />
                  </Button>
                </Box>
              ))}
            </Box>

            <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 4, backgroundColor: '#001e61', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', py: 1.5, fontSize: '16px', '&:hover': { backgroundColor: '#001447' } }}>
              {selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;