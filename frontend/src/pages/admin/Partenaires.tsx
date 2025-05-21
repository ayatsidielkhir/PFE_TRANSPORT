import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Avatar, Pagination, InputAdornment
} from '@mui/material';
import { Delete, Edit, Add, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

interface Partenaire {
  _id: string;
  nom: string;
  ice: string;
  logo?: string;
  adresse: string;
}

const PartenairesPage: React.FC = () => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<Partenaire | null>(null);
  const [form, setForm] = useState({ nom: '', ice: '', adresse: '', logo: null as File | null });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchPartenaires = async () => {
    const res = await axios.get('http://localhost:5000/api/partenaires');
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
    if (form.logo) formData.append('logo', form.logo);

    if (editData) {
      await axios.put(`http://localhost:5000/api/partenaires/${editData._id}`, formData);
    } else {
      await axios.post('http://localhost:5000/api/partenaires', formData);
    }

    setDrawerOpen(false);
    setEditData(null);
    setForm({ nom: '', ice: '', adresse: '', logo: null });
    fetchPartenaires();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/partenaires/${id}`);
    fetchPartenaires();
  };

  const filtered = partenaires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <h2>Liste Des Partenaires</h2>

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
            sx={{ width: '30%' }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setEditData(null);
            setForm({ nom: '', ice: '', adresse: '', logo: null });
            setDrawerOpen(true);
          }}>
            Ajouter
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              {['Logo', 'Nom', 'ICE', 'Adresse', 'Actions'].map(h => (
                <TableCell key={h}><strong>{h}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((p, i) => (
              <TableRow key={p._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <TableCell>
                  {p.logo ? (
                    <Avatar
                        src={`http://localhost:5000/uploads/partenaires/${p.logo}`}
                        alt="logo"
                        sx={{
                          width: 50,
                          height: 50,
                          transition: 'transform 0.5s ease-in-out',
                          '&:hover': {
                            transform: 'rotate(360deg) scale(1.1)',
                          }
                        }}
                      />

                  ) : 'N/A'}
                </TableCell>
                <TableCell  sx={{fontWeight:'bold'}}>{p.nom}</TableCell>
                <TableCell sx={{fontWeight:'bold'}}>{p.ice}</TableCell>
                <TableCell>{p.adresse}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setEditData(p);
                    setForm({ nom: p.nom, ice: p.ice, adresse: p.adresse, logo: null });
                    setDrawerOpen(true);
                  }}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(p._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filtered.length / perPage)}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box mt={8} p={3} width={400} display="flex" flexDirection="column" alignItems="center">
            <h3>{editData ? 'Modifier Partenaire' : 'Ajouter un Partenaire'}</h3>
            <TextField label="Nom" name="nom" fullWidth margin="normal" value={form.nom} onChange={handleInputChange} />
            <TextField label="ICE" name="ice" fullWidth margin="normal" value={form.ice} onChange={handleInputChange} />
            <TextField label="Adresse" name="adresse" fullWidth margin="normal" value={form.adresse} onChange={handleInputChange} />
            <TextField type="file" name="logo" fullWidth margin="normal" inputProps={{ accept: 'image/*' }} onChange={handleInputChange} />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>Enregistrer</Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PartenairesPage;
