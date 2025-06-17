import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add } from '@mui/icons-material';
import { PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
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

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
const isPdfFile = (filename: string) => /\.pdf$/i.test(filename);

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [dialogIsPdf, setDialogIsPdf] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [form, setForm] = useState<Record<string, string | File | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

  const fetchChauffeurs = async () => {
    try {
      const res = await axios.get(`${API}/api/chauffeurs`);
      setChauffeurs(res.data);
    } catch (error) {
      console.error('Erreur fetch chauffeurs:', error);
    }
  };

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (name === 'photo') setPreviewPhoto(URL.createObjectURL(file));
      setForm(prev => ({ ...prev, [name]: file }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const getPhotoPreviewUrl = () => {
  if (previewPhoto) return previewPhoto;
  if (form.photo && typeof form.photo === 'string') {
    return `${API}/uploads/chauffeurs/${form.photo}`;
  }
  return '';
};


  const renderDocumentAvatar = (file: string | undefined | null) => {
    if (!file) return '—';

    const url = `${API}/uploads/chauffeurs/${file}`;

    if (isImageFile(file)) {
      return (
        <Avatar
          src={url}
          sx={{ width: 40, height: 40, cursor: 'pointer' }}
          variant="rounded"
          onClick={() => {
            setDialogImageSrc(url);
            setDialogIsPdf(false);
            setOpenDialog(true);
          }}
        />
      );
    } else if (isPdfFile(file)) {
      return (
        <Tooltip title="Voir PDF">
          <IconButton
            onClick={() => {
              setDialogImageSrc(url);
              setDialogIsPdf(true);
              setOpenDialog(true);
            }}
            size="small"
          >
            <PictureAsPdf sx={{ fontSize: 28, color: '#d32f2f' }} />
          </IconButton>
        </Tooltip>
      );
    } else {
      return '—';
    }
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.cin) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string' && value.trim() !== '') {
        formData.append(key, value);
      }
    });

    try {
      if (selectedChauffeur) {
        await axios.put(`${API}/api/chauffeurs/${selectedChauffeur._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API}/api/chauffeurs`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchChauffeurs();
      resetForm();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };
  setPreviewPhoto(null);


  const handleEdit = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setForm({
      nom: chauffeur.nom,
      prenom: chauffeur.prenom,
      telephone: chauffeur.telephone,
      cin: chauffeur.cin,
      adresse: chauffeur.adresse || '',
      photo: chauffeur.photo || null,
      scanCIN: chauffeur.scanCIN || null,
      scanPermis: chauffeur.scanPermis || null,
      scanVisa: chauffeur.scanVisa || null,
      certificatBonneConduite: chauffeur.certificatBonneConduite || null,
    });
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce chauffeur ?")) return;
    try {
      await axios.delete(`${API}/api/chauffeurs/${id}`);
      fetchChauffeurs();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Erreur lors de la suppression");
    }
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
                {["Photo", "Nom", "Prénom", "Téléphone", "Adresse", "CIN", "Permis", "Visa", "Certificat", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>
                      <Avatar
                      src={typeof c.photo === 'string' ? `${API}/uploads/chauffeurs/${c.photo}` : ''}
                      sx={{ width: 40, height: 40 }}
                      variant="rounded"
                    />

                  </TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Visualiser le document</DialogTitle>
          <DialogContent sx={{ height: dialogIsPdf ? 600 : 'auto' }}>
            {dialogIsPdf ? (
              <iframe
                src={dialogImageSrc}
                style={{ width: '100%', height: '600px', border: 'none' }}
                title="Visualisation PDF"
              />
            ) : (
              <Box component="img" src={dialogImageSrc} alt="document" width="100%" />
            )}
          </DialogContent>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

            <Box>
              {/* Photo du chauffeur */}
              <Box display="flex" justifyContent="center" mb={3} mt={10}>
                <label htmlFor="photo">
                  <Avatar
                    src={getPhotoPreviewUrl()}
                    sx={{
                      width: 110,
                      height: 110,
                      cursor: 'pointer',
                      borderRadius: '50%',
                      boxShadow: 2,
                      backgroundColor: '#f0f0f0'
                    }}
                  />

                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
              </Box>

              {/* Champs 2 colonnes */}
              <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                {['nom', 'prenom', 'telephone', 'cin'].map((field) => (
                  <Box key={field} flex="1 1 45%">
                    <TextField
                      name={field}
                      value={form[field] as string}
                      onChange={handleInputChange}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      fullWidth
                      sx={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Adresse */}
              <TextField
                name="adresse"
                value={form.adresse as string}
                onChange={handleInputChange}
                placeholder="Adresse"
                fullWidth
                sx={{
                  mb: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              {/* Fichiers PDF/Image */}
              <Box display="flex" flexWrap="wrap" gap={2}>
                {[
                  { label: 'Scan CIN', name: 'scanCIN' },
                  { label: 'Scan Permis', name: 'scanPermis' },
                  { label: 'Scan Visa', name: 'scanVisa' },
                  { label: 'Extrait de Casier Judiciaire', name: 'certificatBonneConduite' }
                ].map(({ label, name }) => (
                  <Box key={name} flex="1 1 45%">
                    <Typography variant="body2" fontWeight={500} mb={0.5}>{label}</Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          color: '#0d47a1',
                          borderColor: '#90caf9',
                          '&:hover': { borderColor: '#0d47a1' }
                        }}
                      >
                        {(() => {
                          const val = form[name];
                          if (val && typeof val === 'string') return val;
                          if (val instanceof File) return val.name;
                          return 'Choisir un fichier';
                        })()}
                        <input type="file" hidden name={name} onChange={handleInputChange} />
                      </Button>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Bouton soumettre */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                mt: 3,
                backgroundColor: '#001e61',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                py: 1.2,
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
