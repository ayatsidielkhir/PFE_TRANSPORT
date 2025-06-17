// ✅ Page Chauffeurs avec style "Docs" identique à Véhicules — FONCTIONNELLE ET COMPLÈTE

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add, PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

interface Chauffeur {
  _id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  adresse?: string;
  photo?: string | File | null;
  scanCIN?: string | File | null;
  scanPermis?: string | File | null;
  scanVisa?: string | File | null;
  certificatBonneConduite?: string | File | null;
}


const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const isPdfFile = (filename: string) => /\.pdf$/i.test(filename);

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedDocsChauffeur, setSelectedDocsChauffeur] = useState<Chauffeur | null>(null);
  const [openDocsModal, setOpenDocsModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [form, setForm] = useState<Partial<Chauffeur> & { [key: string]: any }>({
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
    if (form.photo && typeof form.photo === 'string') return `${API}/uploads/chauffeurs/${form.photo}`;
    return '';
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.cin) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value instanceof File) formData.append(key, value);
      else if (typeof value === 'string') formData.append(key, value);
    });
    try {
      if (selectedChauffeur && selectedChauffeur._id) {
        await axios.put(`${API}/api/chauffeurs/${selectedChauffeur._id}`, formData);
      } else {
        await axios.post(`${API}/api/chauffeurs`, formData);
      }
      fetchChauffeurs();
      resetForm();
      setDrawerOpen(false);
      setPreviewPhoto(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setForm({ ...chauffeur });
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm("Supprimer ce chauffeur ?")) return;
    try {
      await axios.delete(`${API}/api/chauffeurs/${id}`);
      fetchChauffeurs();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setForm({ nom: '', prenom: '', telephone: '', cin: '', adresse: '', photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null });
    setSelectedChauffeur(null);
    setPreviewPhoto(null);
  };

  const filtered = chauffeurs.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.prenom.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <Typography variant="h5" fontWeight={600} mb={3}>Gestion des Chauffeurs</Typography>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} size="small" />
          <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setDrawerOpen(true); }}>Ajouter</Button>
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Docs</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c, i) => (
                <TableRow key={c._id}>
                  <TableCell><Avatar src={c.photo ? `${API}/uploads/chauffeurs/${c.photo}` : ''} /></TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell>
                    <Tooltip title="Voir les documents">
                      <IconButton onClick={() => { setSelectedDocsChauffeur(c); setOpenDocsModal(true); }}>
                        <PictureAsPdf sx={{ color: 'red' }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} sx={{ mt: 2 }} />

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={360}>
            <Box display="flex" justifyContent="center" mb={2}>
              <label htmlFor="photo">
                <Avatar src={getPhotoPreviewUrl()} sx={{ width: 80, height: 80, cursor: 'pointer' }} />
              </label>
              <input id="photo" name="photo" type="file" accept="image/*" onChange={handleInputChange} style={{ display: 'none' }} />
            </Box>

            {['nom', 'prenom', 'telephone', 'cin', 'adresse'].map(field => (
              <TextField key={field} name={field} label={field} fullWidth sx={{ mb: 2 }} value={form[field] || ''} onChange={handleInputChange} />
            ))}

            {[{ name: 'scanCIN', label: 'CIN' }, { name: 'scanPermis', label: 'Permis' }, { name: 'scanVisa', label: 'Visa' }, { name: 'certificatBonneConduite', label: 'Certificat' }].map(({ name, label }) => (
              <Box key={name} mb={2}>
                <Typography fontWeight={500} mb={0.5}>{label}</Typography>
                <Button component="label" variant="outlined" fullWidth>
                  {form[name] instanceof File ? form[name].name : 'Choisir un fichier PDF'}
                  <input type="file" name={name} hidden accept="application/pdf" onChange={handleInputChange} />
                </Button>
              </Box>
            ))}

            <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>{selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}</Button>
          </Box>
        </Drawer>

        <Dialog open={openDocsModal} onClose={() => setOpenDocsModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Documents du chauffeur</DialogTitle>
          <DialogContent>
            {selectedDocsChauffeur && (
              <Box display="flex" flexWrap="wrap" gap={2}>
                {[{ key: 'scanCIN', label: 'CIN' }, { key: 'scanPermis', label: 'Permis' }, { key: 'scanVisa', label: 'Visa' }, { key: 'certificatBonneConduite', label: 'Certificat' }].map(({ key, label }) => {
                  const file = selectedDocsChauffeur[key as keyof Chauffeur];
                  if (!file || typeof file !== 'string' || !isPdfFile(file)) return null;
                  const url = `${API}/uploads/chauffeurs/${file}`;
                  return (
                    <Box key={key} textAlign="center">
                      <Typography fontSize={14} fontWeight={500}>{label}</Typography>
                      <Tooltip title="Voir le PDF">
                        <IconButton onClick={() => window.open(url, '_blank')}>
                          <PictureAsPdf sx={{ fontSize: 28, color: 'red' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;
