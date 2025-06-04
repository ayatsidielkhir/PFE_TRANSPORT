import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, InputAdornment, Paper, Typography
} from '@mui/material';
import { Delete, Edit, Add, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

interface Partenaire {
  _id: string;
  nom: string;
  ice: string;
  adresse: string;
  email?: string;
  telephone?: string;
  logo?: string;
}

const PartenairesPage: React.FC = () => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<Partenaire | null>(null);
  const [form, setForm] = useState({ nom: '', ice: '', adresse: '', email: '', telephone: '', logo: null as File | null });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchPartenaires = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/partenaires');
    setPartenaires(res.data);
  };

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('nom', form.nom);
    formData.append('ice', form.ice);
    formData.append('adresse', form.adresse);
    formData.append('email', form.email);
    formData.append('telephone', form.telephone);
    if (form.logo) formData.append('logo', form.logo);

    if (editData) {
      await axios.put(`https://mme-backend.onrender.com/api/partenaires/${editData._id}`, formData);
    } else {
      await axios.post('https://mme-backend.onrender.com/api/partenaires', formData);
    }

    setDrawerOpen(false);
    setEditData(null);
    setForm({ nom: '', ice: '', adresse: '', email: '', telephone: '', logo: null });
    fetchPartenaires();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`https://mme-backend.onrender.com/api/partenaires/${id}`);
    fetchPartenaires();
  };

  const filtered = partenaires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="#001447" mb={3}>Liste des Partenaires</Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Rechercher par nom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '30%', backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditData(null);
              setForm({ nom: '', ice: '', adresse: '', email: '', telephone: '', logo: null });
              setDrawerOpen(true);
            }}
            sx={{
              backgroundColor: '#001e61',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#001447' },
              borderRadius: 3,
              px: 3
            }}
          >
            Ajouter
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {['Logo', 'Nom', 'ICE', 'Adresse', 'Email', 'Téléphone', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((p, i) => (
                <TableRow key={p._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>
                    {p.logo ? (
                      <Box
                        component="img"
                        src={`https://mme-backend.onrender.com/uploads/partenaires/${p.logo}`}
                        alt="logo partenaire"
                        sx={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 2, boxShadow: 1 }}
                      />
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{p.nom}</TableCell>
                  <TableCell>{p.ice}</TableCell>
                  <TableCell>{p.adresse}</TableCell>
                  <TableCell>{p.email || '—'}</TableCell>
                  <TableCell>{p.telephone || '—'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => {
                      setEditData(p);
                      setForm({ nom: p.nom, ice: p.ice, adresse: p.adresse, email: p.email || '', telephone: p.telephone || '', logo: null });
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
          <Box mt={8} p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              {editData ? 'Modifier Partenaire' : 'Ajouter un Partenaire'}
            </Typography>
            <TextField label="Nom" name="nom" fullWidth margin="normal" value={form.nom} onChange={handleInputChange} />
            <TextField label="ICE" name="ice" fullWidth margin="normal" value={form.ice} onChange={handleInputChange} />
            <TextField label="Adresse" name="adresse" fullWidth margin="normal" value={form.adresse} onChange={handleInputChange} />
            <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleInputChange} />
            <TextField label="Téléphone" name="telephone" fullWidth margin="normal" value={form.telephone} onChange={handleInputChange} />
            <TextField type="file" name="logo" fullWidth margin="normal" inputProps={{ accept: 'image/*' }} onChange={handleInputChange} />
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#001e61', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}
              onClick={handleSubmit}
            >
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PartenairesPage;