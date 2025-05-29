import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  InputAdornment, Typography, Stack, MenuItem, Select
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

interface Vehicule {
  _id: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  carteGrise?: string;
  assurance?: string;
  controle_technique?: string;
  vignette?: string;
  agrement?: string;
  carte_verte?: string;
  extincteur?: string;
  chauffeur?: string;
}

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [filteredVehicules, setFilteredVehicules] = useState<Vehicule[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicule>>({});
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchVehicules();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/vehicules');
    setVehicules(res.data);
    setFilteredVehicules(res.data);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredVehicules(
      vehicules.filter(v =>
        v.nom.toLowerCase().includes(value.toLowerCase()) ||
        v.matricule.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const paginatedVehicules = filteredVehicules.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Rechercher..."
            value={search}
            onChange={handleSearch}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ width: '50%' }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)}>
            Ajouter
          </Button>
        </Stack>

        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#e3f2fd' }}>
              <TableCell>Nom</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Kilométrage</TableCell>
              <TableCell>Chauffeur</TableCell>
              <TableCell>Carte Grise</TableCell>
              <TableCell>Assurance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVehicules.map((v, i) => (
              <TableRow key={i} sx={{ bgcolor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                <TableCell>{v.nom}</TableCell>
                <TableCell>{v.matricule}</TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell>{v.kilometrage} km</TableCell>
                <TableCell>{v.chauffeur || '—'}</TableCell>
                <TableCell>
                  {v.carteGrise ? (
                    <Tooltip title="Voir">
                      <a href={`https://mme-backend.onrender.com/uploads/vehicules/${v.carteGrise}`} target="_blank" rel="noreferrer">
                        <Avatar src={`https://mme-backend.onrender.com/uploads/vehicules/${v.carteGrise}`} variant="rounded" sx={{ width: 40, height: 40 }} />
                      </a>
                    </Tooltip>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {v.assurance ? (
                    <Tooltip title="Voir">
                      <a href={`https://mme-backend.onrender.com/uploads/vehicules/${v.assurance}`} target="_blank" rel="noreferrer">
                        <Avatar src={`https://mme-backend.onrender.com/uploads/vehicules/${v.assurance}`} variant="rounded" sx={{ width: 40, height: 40 }} />
                      </a>
                    </Tooltip>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => setDrawerOpen(true)}><Edit /></IconButton>
                  <IconButton color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination
          count={Math.ceil(filteredVehicules.length / perPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={2}>Ajouter un véhicule</Typography>
            {/* Formulaire d'ajout */}
            <TextField label="Nom" fullWidth sx={{ mb: 2 }} />
            <TextField label="Matricule" fullWidth sx={{ mb: 2 }} />
            <Select fullWidth displayEmpty defaultValue="">
              <MenuItem value="">Sélectionner le type</MenuItem>
              <MenuItem value="Camion">Camion</MenuItem>
              <MenuItem value="Tracteur">Tracteur</MenuItem>
              <MenuItem value="Voiture">Voiture</MenuItem>
            </Select>
            <TextField label="Kilométrage" type="number" fullWidth sx={{ mt: 2 }} />
            <Button variant="contained" fullWidth sx={{ mt: 3 }}>Enregistrer</Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
