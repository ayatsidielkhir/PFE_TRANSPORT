// ✅ Page partenaires complète avec upload contrat PDF
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, InputAdornment, Paper, Typography, Avatar
} from '@mui/material';
import { Delete, Edit, Add, Search as SearchIcon, Handshake, PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const API = process.env.REACT_APP_API_URL;

interface Partenaire {
  _id: string;
  nom: string;
  ice: string;
  adresse: string;
  email?: string;
  telephone?: string;
  logo?: string;
  contrat?: string;
}

const PartenairesPage: React.FC = () => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<Partenaire | null>(null);
  const [form, setForm] = useState({
    nom: '', ice: '', adresse: '', email: '', telephone: '',
    logo: null as File | null,
    contrat: null as File | null
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchPartenaires = async () => {
    try {
      const res = await axios.get(`${API}/partenaires`);
      setPartenaires(res.data);
    } catch (err) {
      console.error('Erreur chargement partenaires :', err);
    }
  };

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('ice', form.ice);
      formData.append('adresse', form.adresse);
      formData.append('email', form.email);
      formData.append('telephone', form.telephone);
      if (form.logo) formData.append('logo', form.logo);
      if (form.contrat) formData.append('contrat', form.contrat);

      if (editData) {
        await axios.put(`${API}/partenaires/${editData._id}`, formData);
      } else {
        await axios.post(`${API}/partenaires`, formData);
      }

      setDrawerOpen(false);
      setEditData(null);
      setForm({ nom: '', ice: '', adresse: '', email: '', telephone: '', logo: null, contrat: null });
      fetchPartenaires();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement :', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/partenaires/${id}`);
      fetchPartenaires();
    } catch (err) {
      console.error('Erreur suppression partenaire :', err);
    }
  };

  const filtered = partenaires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
          <Handshake sx={{ width: 40, height: 32 }} />
          Gestion des Partenaires
        </Typography>

        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2}>
            <TextField
              size="small"
              placeholder="Rechercher un partenaire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: isMobile ? '100%' : '35%', backgroundColor: 'white', borderRadius: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditData(null);
                setForm({ nom: '', ice: '', adresse: '', email: '', telephone: '', logo: null, contrat: null });
                setDrawerOpen(true);
              }}
              sx={{
                backgroundColor: '#001e61', borderRadius: 3, textTransform: 'none',
                fontWeight: 'bold', px: 3, boxShadow: 2,
                '&:hover': { backgroundColor: '#001447' },
                width: isMobile ? '100%' : 'auto'
              }}
            >
              Ajouter un partenaire
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {['Logo', 'Nom', 'ICE', 'Adresse', 'Email', 'Téléphone', 'Contrat', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((p, i) => (
                <TableRow key={p._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>
                    {p.logo ? (
                      <Box component="img" src={`https://mme-backend.onrender.com/uploads/partenaires/${p.logo}`} alt="logo partenaire" sx={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 2 }} />
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{p.nom}</TableCell>
                  <TableCell>{p.ice}</TableCell>
                  <TableCell>{p.adresse}</TableCell>
                  <TableCell>{p.email || '—'}</TableCell>
                  <TableCell>{p.telephone || '—'}</TableCell>
                  <TableCell>
                    {p.contrat ? (
                      <IconButton onClick={() => window.open(`https://mme-backend.onrender.com/uploads/partenaires/${p.contrat}`, '_blank')}>
                        <PictureAsPdf sx={{ color: 'red' }} />
                      </IconButton>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      setEditData(p);
                      setForm({
                        nom: p.nom, ice: p.ice, adresse: p.adresse,
                        email: p.email || '', telephone: p.telephone || '', logo: null, contrat: null
                      });
                      setDrawerOpen(true);
                    }} sx={{ color: '#001e61' }}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(p._id)} sx={{ color: '#d32f2f' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} mt={10} width={isMobile ? '100vw' : 450}>
            <Box display="flex" justifyContent="center" mb={3}>
              <label htmlFor="logo-input">
                <Avatar
                  src={form.logo instanceof File ? URL.createObjectURL(form.logo) : editData?.logo ? `https://mme-backend.onrender.com/uploads/partenaires/${editData.logo}` : undefined}
                  sx={{ width: 110, height: 110, borderRadius: '12px', objectFit: 'contain', backgroundColor: '#f0f0f0', cursor: 'pointer', boxShadow: 2, mt: 2, fontSize: 16, color: '#666' }}
                >
                  {!form.logo && !editData?.logo && 'Logo'}
                </Avatar>
              </label>
              <input id="logo-input" name="logo" type="file" accept="image/*" hidden onChange={handleInputChange} />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              {[{ name: 'nom', label: 'Nom' }, { name: 'ice', label: 'ICE' }, { name: 'adresse', label: 'Adresse' }, { name: 'email', label: 'Email' }, { name: 'telephone', label: 'Téléphone' }].map(({ name, label }) => (
                <Box key={name} flex="1 1 45%">
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name as keyof typeof form] || ''}
                    onChange={handleInputChange}
                    sx={{ '& .MuiInputBase-root': { borderRadius: '12px', backgroundColor: '#f9fafb' } }}
                  />
                </Box>
              ))}
            </Box>

            <Box mb={2}>
              <Typography fontWeight={500} mb={1}>Contrat (PDF)</Typography>
              <Button
                component="label"
                variant="outlined"
                fullWidth
                sx={{ borderRadius: '12px', backgroundColor: '#ffffff', textTransform: 'none', fontSize: '14px', py: 1 }}
              >
                {form.contrat instanceof File ? form.contrat.name : 'Choisir un fichier PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  name="contrat"
                  onChange={handleInputChange}
                />
              </Button>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 4, backgroundColor: '#001e61', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', py: 1.5, fontSize: '16px', '&:hover': { backgroundColor: '#001447' } }}
            >
              {editData ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PartenairesPage;