// ✅ Page Chauffeurs avec style "Docs" identique à Véhicules

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

  const [form, setForm] = useState<Record<string, string | File | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

  useEffect(() => { fetchChauffeurs(); }, []);

  const fetchChauffeurs = async () => {
    try {
      const res = await axios.get(`${API}/api/chauffeurs`);
      setChauffeurs(res.data);
    } catch (error) {
      console.error('Erreur fetch chauffeurs:', error);
    }
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
      else if (typeof value === 'string' && value.trim() !== '') formData.append(key, value);
    });
    try {
      if (selectedChauffeur) {
        await axios.put(`${API}/api/chauffeurs/${selectedChauffeur._id}`, formData);
      } else {
        await axios.post(`${API}/api/chauffeurs`, formData);
      }
      fetchChauffeurs();
      resetForm();
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
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
    setForm({ nom: '', prenom: '', telephone: '', cin: '', adresse: '', photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null });
    setSelectedChauffeur(null);
    setPreviewPhoto(null);
  };

  const filtered = chauffeurs.filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.prenom.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3}>Gestion des Chauffeurs</Typography>

        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              size="small"
              placeholder="Rechercher un chauffeur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
              sx={{ width: '35%', backgroundColor: 'white', borderRadius: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setDrawerOpen(true); resetForm(); }}
              sx={{ backgroundColor: '#001e61', borderRadius: 3, textTransform: 'none', fontWeight: 'bold', px: 3, boxShadow: 2 }}
            >Ajouter un chauffeur</Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                {['Photo', 'Nom', 'Prénom', 'Téléphone', 'Adresse', 'Docs', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#2D2D90' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell><Avatar src={c.photo ? `${API}/uploads/chauffeurs/${c.photo}` : ''} variant="rounded" sx={{ width: 40, height: 40 }} /></TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell>{c.adresse}</TableCell>
                  <TableCell>
                    <Tooltip title="Voir les documents">
                      <IconButton onClick={() => { setSelectedDocsChauffeur(c); setOpenDocsModal(true); }}>
                        <PictureAsPdf sx={{ fontSize: 25, color: 'red' }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton color="primary" onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton color="error" onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
        </Box>

        {/* Dialog Docs */}
        <Dialog open={openDocsModal} onClose={() => setOpenDocsModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Documents du chauffeur</DialogTitle>
          <DialogContent>
            {selectedDocsChauffeur && (
              <Box display="flex" flexWrap="wrap" gap={2}>
                {[{ key: 'scanCIN', label: 'CIN' }, { key: 'scanPermis', label: 'Permis' }, { key: 'scanVisa', label: 'Visa' }, { key: 'certificatBonneConduite', label: 'Certificat' }].map(({ key, label }) => {
                  const file = selectedDocsChauffeur[key as keyof Chauffeur];
                  if (!file || !isPdfFile(file)) return null;
                  const url = `${API}/uploads/chauffeurs/${file}`;
                  return (
                    <Box key={key} textAlign="center">
                      <Typography fontSize={14} fontWeight={500}>{label}</Typography>
                      <Tooltip title="Voir PDF">
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
