import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
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

  const filteredPartenaires = partenaires.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <h2>Partenaires</h2>
          <Button variant="contained" onClick={() => {
            setEditData(null);
            setForm({ nom: '', ice: '', adresse: '', logo: null });
            setDrawerOpen(true);
          }}>Ajouter</Button>
        </Box>

        <TextField
          label="Rechercher par nom"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>ICE</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPartenaires.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  {p.logo && (
                    <img src={`http://localhost:5000/uploads/partenaires/${p.logo}`} alt="logo" width={50} />
                  )}
                </TableCell>
                <TableCell>{p.nom}</TableCell>
                <TableCell>{p.ice}</TableCell>
                <TableCell>{p.adresse}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setEditData(p);
                    setForm({ nom: p.nom, ice: p.ice, adresse: p.adresse, logo: null });
                    setDrawerOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={350}>
            <h3>{editData ? 'Modifier Partenaire' : 'Ajouter un partenaire'}</h3>
            <TextField
              label="Nom"
              name="nom"
              fullWidth
              margin="normal"
              value={form.nom}
              onChange={handleInputChange}
            />
            <TextField
              label="ICE"
              name="ice"
              fullWidth
              margin="normal"
              value={form.ice}
              onChange={handleInputChange}
            />
            <TextField
              label="Adresse"
              name="adresse"
              fullWidth
              margin="normal"
              value={form.adresse}
              onChange={handleInputChange}
            />
            <TextField
              type="file"
              name="logo"
              fullWidth
              margin="normal"
              inputProps={{ accept: 'image/*' }}
              onChange={handleInputChange}
            />
            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
              Enregistrer
            </Button>
            {editData && (
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => {
                  setDrawerOpen(false);
                  setEditData(null);
                  setForm({ nom: '', ice: '', adresse: '', logo: null });
                }}
              >
                Annuler
              </Button>
            )}
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default PartenairesPage;