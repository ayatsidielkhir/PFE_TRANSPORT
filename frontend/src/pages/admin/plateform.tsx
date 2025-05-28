import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Drawer, TextField, IconButton, Tooltip, Avatar, Link, Pagination
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
    const res = await axios.get('https://mme-backend.onrender.com
/api/plateformes');
    setPlateformes(res.data);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (logo) formData.append('logo', logo);

    try {
      if (form._id) {
        await axios.put(`https://mme-backend.onrender.com
/api/plateformes/${form._id}`, formData);
      } else {
        await axios.post('https://mme-backend.onrender.com
/api/plateformes', formData);
      }
      setDrawerOpen(false);
      setForm({ nom: '', email: '', password: '', lien: '' });
      setLogo(null);
      fetchPlateformes();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
    }
  };

  const handleEdit = (p: Plateforme) => {
    setForm(p);
    setDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (id && window.confirm('Supprimer cette plateforme ?')) {
      await axios.delete(`https://mme-backend.onrender.com
/api/plateformes/${id}`);
      fetchPlateformes();
    }
  };

  const paginated = plateformes.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5" fontWeight={600}>Liste des Plateformes</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)}>
            Ajouter Plateforme
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              {['Logo', 'Nom', 'Email', 'Mot de passe', 'Lien', 'Actions'].map(h => (
                <TableCell key={h}><strong>{h}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((p, i) => (
              <TableRow key={p._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <TableCell>
                  {p.logo ? <Avatar src={`https://mme-backend.onrender.com
/uploads/platforms/${p.logo}`} /> : 'N/A'}
                </TableCell>
                <TableCell>{p.nom}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.password}</TableCell>
                <TableCell>
                  <Link href={p.lien} target="_blank" rel="noopener noreferrer">
                    {p.lien}
                  </Link>
                </TableCell>
                <TableCell>
                  <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(p)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(p._id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(plateformes.length / perPage)}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Ajouter / Modifier une plateforme</Typography>
            <TextField label="Nom" name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <TextField label="Email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Mot de passe" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField label="Lien de la plateforme" name="lien" value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} />
            <Button variant="outlined" component="label">
              Télécharger Logo
              <input type="file" hidden onChange={e => setLogo(e.target.files?.[0] || null)} />
            </Button>
            <Button variant="contained" onClick={handleSubmit}>Enregistrer</Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PlateformesPage;
