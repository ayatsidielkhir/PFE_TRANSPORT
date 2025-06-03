// ✅ TrajetsPage.tsx avec style modernisé : titre, Drawer, boutons Import/Export, champs stylisés

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, SelectChangeEvent, Checkbox,
  Typography, IconButton, Tooltip, Pagination, Avatar, useMediaQuery
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

interface Vehicule {
  _id: string;
  matricule: string;
}

interface Partenaire {
  _id: string;
  nom: string;
  logo?: string;
}

interface Trajet {
  _id?: string;
  depart: string;
  arrivee: string;
  date: string;
  chauffeur: string;
  vehicule: string;
  partenaire?: string;
  distanceKm: number;
  consommationL: number;
  consommationMAD?: number;
  importExport?: 'import' | 'export';
}

const TrajetsPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Trajet>({
    depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '', distanceKm: 0,
    consommationL: 0, consommationMAD: 0, partenaire: '', importExport: undefined
  });
  const [filters, setFilters] = useState({ mois: '', partenaire: '' });
  const [page, setPage] = useState(1);
  const perPage = 5;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    const query = new URLSearchParams();
    if (filters.mois) query.append('mois', filters.mois);
    if (filters.partenaire) query.append('partenaire', filters.partenaire);

    const [trajetRes, chaufRes, vehicRes, partRes] = await Promise.all([
      axios.get(`https://mme-backend.onrender.com/api/trajets?${query.toString()}`),
      axios.get('https://mme-backend.onrender.com/api/chauffeurs'),
      axios.get('https://mme-backend.onrender.com/api/vehicules'),
      axios.get('https://mme-backend.onrender.com/api/partenaires')
    ]);

    const trajets = trajetRes.data.map((t: any) => ({
      ...t,
      chauffeur: typeof t.chauffeur === 'object' ? t.chauffeur._id : t.chauffeur,
      vehicule: typeof t.vehicule === 'object' ? t.vehicule._id : t.vehicule,
      partenaire: typeof t.partenaire === 'object' ? t.partenaire._id : t.partenaire,
    }));

    setTrajets(trajets);
    setChauffeurs(chaufRes.data);
    setVehicules(vehicRes.data);
    setPartenaires(partRes.data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const url = form._id
      ? `https://mme-backend.onrender.com/api/trajets/${form._id}`
      : 'https://mme-backend.onrender.com/api/trajets';
    const method = form._id ? 'put' : 'post';

    await axios[method](url, form);
    setDrawerOpen(false);
    fetchData();
  };

  const handleEdit = (t: Trajet) => {
    setForm(t);
    setDrawerOpen(true);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !window.confirm('Supprimer ce trajet ?')) return;
    await axios.delete(`https://mme-backend.onrender.com/api/trajets/${id}`);
    fetchData();
  };

  const getChauffeurName = (id?: string) => {
    const ch = chauffeurs.find(c => c._id === id);
    return ch ? `${ch.nom} ${ch.prenom}` : '';
  };

  const getVehiculeMatricule = (id?: string) => {
    const v = vehicules.find(v => v._id === id);
    return v ? v.matricule : '';
  };

  const getPartenaire = (id?: string) => partenaires.find(p => p._id === id);

  const paginated = trajets.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001e61" mb={3} display="flex" alignItems="center" gap={1}>
          <Person sx={{ fontSize: 32 }} />
          Gestion des Trajets
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              type="month"
              value={filters.mois}
              onChange={(e) => setFilters({ ...filters, mois: e.target.value })}
              InputLabelProps={{ shrink: true }}
              placeholder="Mois"
              sx={{ width: 200 }}
            />
            <Select
              size="small"
              value={filters.partenaire}
              onChange={(e) => setFilters({ ...filters, partenaire: e.target.value })}
              displayEmpty
            >
              <MenuItem value="">Tous les partenaires</MenuItem>
              {partenaires.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>
              ))}
            </Select>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ height: 40, backgroundColor: '#001e61', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}
            onClick={() => {
              setForm({
                depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '',
                distanceKm: 0, consommationL: 0, consommationMAD: 0,
                partenaire: '', importExport: undefined
              });
              setDrawerOpen(true);
            }}
          >
            Ajouter Trajet
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              {['Itinéraire', 'Date', 'Chauffeur', 'Véhicule', 'Distance', 'Conso. L', 'Conso. MAD', 'Partenaire', 'Type', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 'bold', color: '#001e61' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((t, i) => {
              const part = getPartenaire(t.partenaire);
              return (
                <TableRow key={t._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{t.depart} – {t.arrivee}</TableCell>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getChauffeurName(t.chauffeur)}</TableCell>
                  <TableCell>{getVehiculeMatricule(t.vehicule)}</TableCell>
                  <TableCell>{t.distanceKm} km</TableCell>
                  <TableCell>{t.consommationL} L</TableCell>
                  <TableCell>{t.consommationMAD} MAD</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {part?.logo && (
                        <Avatar src={`https://mme-backend.onrender.com/uploads/partenaires/${part.logo}`} sx={{ width: 28, height: 28 }} />
                      )}
                      <Typography variant="body2">{part?.nom}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{t.importExport}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(t)} sx={{ color: '#001e61' }}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(t._id)} sx={{ color: '#d32f2f' }}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(trajets.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
        </Box>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 420, p: 3, backgroundColor: '#f9f9f9', boxShadow: 6, borderRadius: '12px 0 0 12px' } }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" mb={2}>{form._id ? 'Modifier un Trajet' : 'Ajouter un Trajet'}</Typography>

            <TextField label="Départ" name="depart" fullWidth margin="normal" value={form.depart} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />
            <TextField label="Arrivée" name="arrivee" fullWidth margin="normal" value={form.arrivee} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />
            <TextField type="date" name="date" fullWidth margin="normal" value={form.date} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />

            <Select name="chauffeur" fullWidth value={form.chauffeur} onChange={handleSelectChange} displayEmpty sx={{ mt: 2, backgroundColor: '#fff', borderRadius: 2 }}>
              <MenuItem value="">Sélectionner chauffeur</MenuItem>
              {chauffeurs.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
              ))}
            </Select>

            <Select name="vehicule" fullWidth value={form.vehicule} onChange={handleSelectChange} displayEmpty sx={{ mt: 2, backgroundColor: '#fff', borderRadius: 2 }}>
              <MenuItem value="">Sélectionner véhicule</MenuItem>
              {vehicules.map(v => (
                <MenuItem key={v._id} value={v._id}>{v.matricule}</MenuItem>
              ))}
            </Select>

            <TextField label="Distance (km)" type="number" name="distanceKm" fullWidth margin="normal" value={form.distanceKm} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />
            <TextField label="Consommation (L)" type="number" name="consommationL" fullWidth margin="normal" value={form.consommationL} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />
            <TextField label="Consommation (MAD)" type="number" name="consommationMAD" fullWidth margin="normal" value={form.consommationMAD} onChange={handleInputChange} sx={{ '& .MuiInputBase-root': { borderRadius: 2, backgroundColor: '#fff' } }} />

            <Select name="partenaire" fullWidth value={form.partenaire || ''} onChange={handleSelectChange} displayEmpty sx={{ mt: 2, backgroundColor: '#fff', borderRadius: 2 }}>
              <MenuItem value="">Sélectionner partenaire</MenuItem>
              {partenaires.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>
              ))}
            </Select>

            <Box mt={3} display="flex" justifyContent="center" gap={2}>
              {['import', 'export'].map(type => (
                <Button
                  key={type}
                  variant={form.importExport === type ? 'contained' : 'outlined'}
                  onClick={() => setForm({ ...form, importExport: type as 'import' | 'export' })}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: form.importExport === type ? '#001e61' : '#fff',
                    color: form.importExport === type ? '#fff' : '#001e61',
                    fontWeight: 'bold',
                    borderColor: '#001e61',
                    '&:hover': {
                      backgroundColor: form.importExport === type ? '#001447' : '#f0f0f0'
                    }
                  }}
                >
                  {type === 'import' ? 'Import' : 'Export'}
                </Button>
              ))}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              sx={{
                mt: 4,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#001e61',
                fontWeight: 'bold',
                fontSize: 16,
                '&:hover': { backgroundColor: '#001447' }
              }}
            >
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default TrajetsPage;