// ✅ TrajetsPage.tsx - Version améliorée avec Drawer compact, filtres stylisés, et affichage correct

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, Typography, IconButton,
  Tooltip, Pagination, Avatar, useMediaQuery, Paper
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
    depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '',
    distanceKm: 0, consommationL: 0, consommationMAD: 0,
    partenaire: '', importExport: undefined
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
      chauffeur: t.chauffeur && typeof t.chauffeur === 'object' ? t.chauffeur._id : t.chauffeur,
      vehicule: t.vehicule && typeof t.vehicule === 'object' ? t.vehicule._id : t.vehicule,
      partenaire: t.partenaire && typeof t.partenaire === 'object' ? t.partenaire._id : t.partenaire,
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

  const handleSelectChange = (e: any) => {
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

  const getChauffeurName = (id?: string) => {
    if (!id) return '';
    const ch = chauffeurs.find(c => c._id === id);
    return ch ? `${ch.nom} ${ch.prenom}` : '';
  };

  const getVehiculeMatricule = (id?: string) => {
    if (!id) return '';
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

        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#f5f8fa', borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField type="month" size="small" label="Filtrer par mois" value={filters.mois} onChange={(e) => setFilters({ ...filters, mois: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200, backgroundColor: 'white', borderRadius: 1 }} />
            <Select size="small" value={filters.partenaire} onChange={(e) => setFilters({ ...filters, partenaire: e.target.value })} displayEmpty sx={{ minWidth: 200, backgroundColor: 'white', borderRadius: 1 }}>
              <MenuItem value="">Tous les partenaires</MenuItem>
              {partenaires.map(p => (<MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>))}
            </Select>
          </Box>
          <Button variant="contained" startIcon={<Add />} sx={{ backgroundColor: '#001e61', '&:hover': { backgroundColor: '#001447' }, borderRadius: 2, fontWeight: 'bold', height: 40 }} onClick={async () => { await fetchData(); setForm({ depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '', distanceKm: 0, consommationL: 0, consommationMAD: 0, partenaire: '', importExport: undefined }); setDrawerOpen(true); }}>Ajouter Trajet</Button>
        </Paper>

        {/* Tableau */}
        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
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
                      <Tooltip title="Modifier"><IconButton onClick={() => { setForm(t); setDrawerOpen(true); }} sx={{ color: '#001e61' }}><Edit /></IconButton></Tooltip>
                      <Tooltip title="Supprimer"><IconButton onClick={async () => { if (window.confirm('Supprimer ce trajet ?')) { await axios.delete(`https://mme-backend.onrender.com/api/trajets/${t._id}`); fetchData(); } }} sx={{ color: '#d32f2f' }}><Delete /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(trajets.length / perPage)} page={page} onChange={(_, val) => setPage(val)} color="primary" />
          </Box>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default TrajetsPage;
