  import React, { useEffect, useState } from 'react';
  import {
    Box, Button, Drawer, TextField, Table, TableBody, TableCell,
    TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
    Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper
  } from '@mui/material';
  import { Delete, Edit, Search as SearchIcon, Add } from '@mui/icons-material';
  import axios from '../../utils/axios';
  import AdminLayout from '../../components/Layout';

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

    // Form state
    const [form, setForm] = useState<Record<string, string | Blob | null>>({
      nom: '', prenom: '', telephone: '', cin: '', adresse: '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });

<<<<<<< HEAD
  return (
    <AdminLayout>
      <Box p={isMobile ? 1 : 2}>
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
          <Person sx={{ width: 45, height: 32 }} />
          Gestion Des Chauffeurs test 1
        </Typography>
=======
    // Vérifier si fichier image
    const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
>>>>>>> 468fcd469a03ce2c4cc4e443868f2965b7af282a

    // Affichage avatar ou icône PDF
    const renderDocumentAvatar = (file: string | undefined) => {
      if (!file) return '—';
      const url = `http://localhost:5000/uploads/chauffeurs/${file}`;
      return (
        <Avatar
          src={isImageFile(file) ? url : '/pdf-icon.png'}
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          onClick={() => { setDialogImageSrc(url); setOpenDialog(true); }}
          variant="rounded"
        />
      );
    };

    // Chargement chauffeurs depuis backend
    const fetchChauffeurs = async () => {
      try {
        const res = await axios.get('/chauffeurs');
        setChauffeurs(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des chauffeurs:", error);
      }
    };

    useEffect(() => {
      fetchChauffeurs();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    };

    // Gérer changement formulaire (texte/fichiers)
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

    // Réinitialiser formulaire
    const resetForm = () => {
      setForm({
        nom: '', prenom: '', telephone: '', cin: '', adresse: '',
        photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
      });
      setSelectedChauffeur(null);
      setPreviewPhoto(null);
    };

    // Soumettre formulaire ajout/modif
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
        ? `/chauffeurs/${selectedChauffeur._id}`
        : '/chauffeurs';

      const method = selectedChauffeur ? axios.put : axios.post;

      try {
        await method(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await fetchChauffeurs();
        resetForm();
        setSearch('');
        setPage(1);
        setDrawerOpen(false);
      } catch (err) {
        alert("Erreur lors de l'enregistrement");
        console.error(err);
      }
    };

    // Modifier un chauffeur (préremplir formulaire)
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

    // Supprimer un chauffeur
    const handleDelete = async (id: string) => {
      if (!window.confirm("Supprimer ce chauffeur ?")) return;
      try {
        await axios.delete(`/chauffeurs/${id}`);
        await fetchChauffeurs();
      } catch (err) {
        alert("Erreur lors de la suppression.");
        console.error(err);
      }
    };

    // Filtrer et paginer
    const filtered = chauffeurs.filter(c =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.prenom.toLowerCase().includes(search.toLowerCase())
    );
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    return (
      <AdminLayout>
        <Box p={3} maxWidth="1400px" mx="auto">
          <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
            Gestion des Chauffeurs
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
              onClick={() => { setDrawerOpen(true); resetForm(); }}
            >
              Ajouter un chauffeur
            </Button>
          </Box>

          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {["Photo", "Nom", "Prénom", "Téléphone", "CIN", "Adresse", "CIN", "Permis", "Visa", "Certificat", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((c, i) => (
                  <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell>{renderDocumentAvatar(c.photo)}</TableCell>
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
          </Paper>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filtered.length / perPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
            <DialogTitle>Visualiser le document</DialogTitle>
            <DialogContent>
              <Box component="img" src={dialogImageSrc} alt="document" width="100%" />
            </DialogContent>
          </Dialog>

          <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box p={3} width={400}>
              <Typography variant="h6" fontWeight={600} mb={2}>Ajouter / Modifier Chauffeur</Typography>
              {['nom', 'prenom', 'telephone', 'cin', 'adresse'].map(field => (
                <TextField
                  key={field}
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  value={form[field] as string}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
              ))}
              {['photo', 'scanCIN', 'scanPermis', 'scanVisa', 'certificatBonneConduite'].map(field => (
                <Box key={field} sx={{ mb: 2 }}>
                  <Typography fontWeight={500} mb={0.5}>{field}</Typography>
                  <input type="file" name={field} onChange={handleInputChange} />
                </Box>
              ))}
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: '#001e61',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#001447' }
                }}
              >
                {selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Box>
          </Drawer>
        </Box>
      </AdminLayout>
    );
  };

  export default ChauffeursPage;
