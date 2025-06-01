import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Drawer, TextField, IconButton, Tooltip, Avatar, Link, Pagination, Paper
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Plateforme>({ nom: '', email: '', password: '', lien: '' });
  const [logo, setLogo] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => { fetchPlateformes(); }, []);

  const fetchPlateformes = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/plateformes');
    setPlateformes(res.data);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo) formData.append('logo', logo);

    try {
      if (form._id) {
        await axios.put(`https://mme-backend.onrender.com/api/plateformes/${form._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('https://mme-backend.onrender.com/api/plateformes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setDrawerOpen(false);
      setForm({ nom: '', email: '', password: '', lien: '' });
      setLogo(null);
      fetchPlateformes();
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
      await axios.delete(`https://mme-backend.onrender.com/api/plateformes/${id}`);
      fetchPlateformes();
    }
  };

  const paginated = plateformes.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Gestion des Plateformes
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box flex={1} />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => { setDrawerOpen(true); setForm({ nom: '', email: '', password: '', lien: '' }); setLogo(null); }}
            sx={{
              backgroundColor: '#001e61',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              boxShadow: 2,
              '&:hover': { backgroundColor: '#001447' }
            }}
          >
            Ajouter une plateforme
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Logo', 'Nom', 'Email', 'Mot de passe', 'Lien', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>
                    {h}
                  </TableCell>
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
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(plateformes.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
        </Box>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
        >
          <Box p={3} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" fontWeight={600}>Ajouter / Modifier une plateforme</Typography>
            <TextField label="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Mot de passe" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
            <TextField label="Lien" value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} fullWidth />
            <Button variant="outlined" component="label">
              Télécharger Logo
              <input type="file" hidden onChange={e => setLogo(e.target.files?.[0] || null)} />
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ backgroundColor: '#001e61', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}
            >
              {form._id ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PlateformesPage;
