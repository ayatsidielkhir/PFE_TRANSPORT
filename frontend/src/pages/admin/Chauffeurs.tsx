import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add } from '@mui/icons-material';
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
  const [form, setForm] = useState<Record<string, string | Blob | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

  const isImageFile = (filename: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  const renderDocumentAvatar = (file: string | undefined) => {
    if (!file) return '—';
    const url = `https://mme-backend.onrender.com/uploads/chauffeurs/${file}`;
    return (
      <Avatar
        src={isImageFile(file) ? url : '/pdf-icon.png'}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => { setDialogImageSrc(url); setOpenDialog(true); }}
      />
    );
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
      if (name === 'photo') {
        setPreviewPhoto(URL.createObjectURL(file));
      }
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
    setForm({ nom: '', prenom: '', telephone: '', cin: '', adresse: '', photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null });
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
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={700}>Gestion des Chauffeurs</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => { setDrawerOpen(true); resetForm(); }}>
            Ajouter Chauffeur
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Rechercher par nom ou prénom..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
          }}
          sx={{ mb: 2 }}
        />

        <Table size="small">
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>CIN</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>CIN Doc</TableCell>
              <TableCell>Permis</TableCell>
              <TableCell>Visa</TableCell>
              <TableCell>Certificat</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((c, i) => (
              <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? 'white' : '#f5f5f5' }}>
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
                  <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box mt={2} display="flex" justifyContent="center">
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
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
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              {selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;
