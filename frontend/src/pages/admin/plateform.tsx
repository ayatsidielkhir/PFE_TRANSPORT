import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Drawer, TextField, IconButton, Tooltip, Avatar, Link, Pagination, Paper,
  InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Language, Search as SearchIcon, Margin } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

const API = process.env.REACT_APP_API_URL;


interface Plateforme {
  _id?: string;
  nom: string;
  email: string;
  password: string;
  lien: string;
  logo?: string;
}

const PlateformesPage: React.FC = () => {
  const [plateformes, setPlateformes] = useState<Plateforme[]>([]);
  const [filteredPlateformes, setFilteredPlateformes] = useState<Plateforme[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Plateforme>({ nom: '', email: '', password: '', lien: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
      axios.get(`${API}/plateformes`).then(res => {
      setPlateformes(res.data);
      setFilteredPlateformes(res.data);
    });
  }, []);

  const fetchPlateformes = async () => {
    const res = await axios.get('${API}/plateformes');
    setPlateformes(res.data);
    setFilteredPlateformes(res.data);
  };

  const handleSubmit = async () => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => formData.append(key, value));
  if (logo) formData.append('logo', logo);

  try {
    let response;
    if (form._id) {
      response = await axios.put(`${API}/plateformes/${form._id}`, formData);
    } else {
      response = await axios.post(`${API}/plateformes`, formData);
    }

    const saved = response.data;

    // ✅ mettre à jour la liste avec données persistées
    fetchPlateformes();

    // ✅ Réinitialiser le formulaire
    setDrawerOpen(false);
    setForm({ nom: '', email: '', password: '', lien: '', _id: saved._id, logo: saved.logo });
    setLogo(null);
  } catch (error) {
    alert("Erreur lors de l'enregistrement");
  }
};


  const handleEdit = (p: Plateforme) => {
    setForm(p);
    setDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Supprimer cette plateforme ?')) {
      await axios.delete(`${API}/plateformes/${id}`);
      fetchPlateformes();
    }
  };

  const paginated = filteredPlateformes.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001e61" mb={3} display="flex" alignItems="center" gap={1}>
          <Language sx={{ fontSize: 32 }} />
          Gestion des Plateformes
        </Typography>

        {/* Barre de recherche + bouton ajouter */}
        <Paper elevation={2} sx={{
          p: 2, mb: 3, backgroundColor: '#e3f2fd',
          borderRadius: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
        }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              setFilteredPlateformes(
                plateformes.filter(p =>
                  p.nom.toLowerCase().includes(e.target.value.toLowerCase())
                )
              );
            }}
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              minWidth: 250
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setDrawerOpen(true);
              setForm({ nom: '', email: '', password: '', lien: '' });
              setLogo(null);
            }}
            sx={{
              backgroundColor: '#001e61',
              '&:hover': { backgroundColor: '#001447' },
              borderRadius: 2,
              fontWeight: 'bold',
              height: 40,
              textTransform: 'none'
            }}
          >
            Ajouter une plateforme
          </Button>
        </Paper>

        {/* Tableau */}
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {['Logo', 'Nom', 'Email', 'Mot de passe', 'Lien', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((p, i) => (
                <TableRow
                  key={p._id}
                  sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}
                >
                  <TableCell>
                    {p.logo ? (
                      <Avatar
                        src={`https://mme-backend.onrender.com/uploads/platforms/${p.logo}`}
                        alt="logo"
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : '—'}
                  </TableCell>
                  <TableCell>{p.nom}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.password}</TableCell>
                  <TableCell>
                    <Link href={p.lien} target="_blank" rel="noopener noreferrer">{p.lien}</Link>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(p)}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(p._id)}><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(filteredPlateformes.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
          </Box>
        </Paper>

        {/* Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} mt={8} width={{ xs: '100vw', sm: 450}}>
            <Typography variant="h6" fontWeight="bold" color="#001e61" mb={3}>
              {form._id ? 'Modifier la plateforme' : 'Ajouter une plateforme'}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} >
              <TextField label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} fullWidth />
              <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
              <TextField label="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
              <TextField label="Lien" value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} fullWidth />

              <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
                Télécharger le logo
                <input type="file" hidden onChange={e => setLogo(e.target.files?.[0] || null)} />
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                fullWidth
                sx={{
                  mt: 1,
                  backgroundColor: '#001e61',
                  '&:hover': { backgroundColor: '#001447' },
                  fontWeight: 'bold',
                  borderRadius: 2
                }}
              >
                {form._id ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PlateformesPage;
