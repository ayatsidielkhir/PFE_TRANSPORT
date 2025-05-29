import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, SelectChangeEvent, Checkbox,
  FormControlLabel, Typography, IconButton, Tooltip, Pagination, Avatar
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

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

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    const query = new URLSearchParams();
    if (filters.mois) query.append('mois', filters.mois);
    if (filters.partenaire) query.append('partenaire', filters.partenaire);

    const [trajetRes, chaufRes, vehicRes, partRes] = await Promise.all([
      axios.get(`http://localhost:5000/api/trajets?${query.toString()}`),
      axios.get('http://localhost:5000/api/chauffeurs'),
      axios.get('http://localhost:5000/api/vehicules'),
      axios.get('http://localhost:5000/api/partenaires')
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
      ? `http://localhost:5000/api/trajets/${form._id}`
      : 'http://localhost:5000/api/trajets';
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
    await axios.delete(`http://localhost:5000/api/trajets/${id}`);
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
      <Box p={3} width="100%" maxWidth="100%" sx={{ marginLeft: 0 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>Liste des Trajets</Typography>

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
            sx={{ height: 40 }}
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
              {["Itinéraire", "Date", "Chauffeur", "Véhicule", "Distance", "Conso. L", "Conso. MAD", "Partenaire", "Type", "Actions"].map(h => (
                <TableCell key={h}><strong>{h}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((t, i) => {
              const part = getPartenaire(t.partenaire);
              return (
                <TableRow key={t._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
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
                        <Avatar
                          src={`http://localhost:5000/uploads/partenaires/${part.logo}`}
                          sx={{ width: 28, height: 28 }}
                        />
                      )}
                      <Typography variant="body2">{part?.nom}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{t.importExport}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(t)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(t._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(trajets.length / perPage)}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>

          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              zIndex: 1201, // plus que la sidebar mais moins que AppBar
              '& .MuiDrawer-paper': {
                width: 400,
                boxSizing: 'border-box',
              }
            }}
>          <Box mt={8} p={3} width={400} display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h6" mb={2}>{form._id ? 'Modifier Trajet' : 'Ajouter Trajet'}</Typography>
            <TextField label="Départ" name="depart" fullWidth margin="normal" value={form.depart} onChange={handleInputChange} />
            <TextField label="Arrivée" name="arrivee" fullWidth margin="normal" value={form.arrivee} onChange={handleInputChange} />
            <TextField type="date" name="date" fullWidth margin="normal" value={form.date} onChange={handleInputChange} />

            <Select name="chauffeur" fullWidth value={form.chauffeur} onChange={handleSelectChange} displayEmpty sx={{ mt: 2 }}>
              <MenuItem value="">Sélectionner chauffeur</MenuItem>
              {chauffeurs.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
              ))}
            </Select>

            <Select name="vehicule" fullWidth value={form.vehicule} onChange={handleSelectChange} displayEmpty sx={{ mt: 2 }}>
              <MenuItem value="">Sélectionner véhicule</MenuItem>
              {vehicules.map(v => (
                <MenuItem key={v._id} value={v._id}>{v.matricule}</MenuItem>
              ))}
            </Select>

            <TextField label="Distance (km)" type="number" name="distanceKm" fullWidth margin="normal" value={form.distanceKm} onChange={handleInputChange} />
            <TextField label="Consommation (L)" type="number" name="consommationL" fullWidth margin="normal" value={form.consommationL} onChange={handleInputChange} />
            <TextField label="Consommation (MAD)" type="number" name="consommationMAD" fullWidth margin="normal" value={form.consommationMAD} onChange={handleInputChange} />

            <Select name="partenaire" fullWidth value={form.partenaire || ''} onChange={handleSelectChange} displayEmpty sx={{ mt: 2 }}>
              <MenuItem value="">Sélectionner partenaire</MenuItem>
              {partenaires.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>
              ))}
            </Select>

            <Box mt={2}>
              <FormControlLabel control={<Checkbox checked={form.importExport === 'import'} onChange={() => setForm({ ...form, importExport: 'import' })} />} label="Import" />
              <FormControlLabel control={<Checkbox checked={form.importExport === 'export'} onChange={() => setForm({ ...form, importExport: 'export' })} />} label="Export" />
            </Box>

            <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 3 }}>
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default TrajetsPage;