import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, SelectChangeEvent, Checkbox,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';

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
}

interface Trajet {
  _id?: string;
  depart: string;
  arrivee: string;
  date: string;
  chauffeur: string;
  vehicule: string;
  distanceKm: number;
  consommationL: number;
  consommationMAD?: number;
  partenaire?: string;
  importExport?: 'import' | 'export';
}

const TrajetsPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Trajet>({
    depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '', distanceKm: 0, consommationL: 0,
    consommationMAD: 0, partenaire: '', importExport: undefined
  });
  const [filters, setFilters] = useState({ mois: '', partenaire: '' });

  const fetchData = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.mois) query.append('mois', filters.mois);
      if (filters.partenaire) query.append('partenaire', filters.partenaire);

      const [trajetRes, chaufRes, vehicRes, partRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/trajets?${query.toString()}`),
        axios.get('http://localhost:5000/api/chauffeurs'),
        axios.get('http://localhost:5000/api/vehicules'),
        axios.get('http://localhost:5000/api/partenaires')
      ]);

      setTrajets(trajetRes.data);
      setChauffeurs(chaufRes.data);
      setVehicules(vehicRes.data);
      setPartenaires(partRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/trajets', form);
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erreur lors de la création du trajet", err);
    }
  };

  const getChauffeurName = (id: string) => {
    const ch = chauffeurs.find(c => c._id === id);
    return ch ? `${ch.nom} ${ch.prenom}` : '';
  };

  const getVehiculeMatricule = (id: string) => {
    const v = vehicules.find(v => v._id === id);
    return v ? v.matricule : '';
  };

  const getPartenaireNom = (id: string) => {
    const p = partenaires.find(p => p._id === id);
    return p ? p.nom : '';
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <h2>Trajets</h2>
        <Button variant="contained" color="primary" onClick={() => setDrawerOpen(true)}>
          Nouveau trajet
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Filtrer par mois"
          type="month"
          onChange={(e) => setFilters({ ...filters, mois: e.target.value })}
        />
        <Select
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

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Itinéraire</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Chauffeur</TableCell>
            <TableCell>Véhicule</TableCell>
            <TableCell>Distance</TableCell>
            <TableCell>Conso. L</TableCell>
            <TableCell>Conso. MAD</TableCell>
            <TableCell>Partenaire</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trajets.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.depart} – {t.arrivee}</TableCell>
              <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
              <TableCell>{getChauffeurName(t.chauffeur)}</TableCell>
              <TableCell>{getVehiculeMatricule(t.vehicule)}</TableCell>
              <TableCell>{t.distanceKm} km</TableCell>
              <TableCell>{t.consommationL} L</TableCell>
              <TableCell>{t.consommationMAD} MAD</TableCell>
              <TableCell>{getPartenaireNom(t.partenaire || '')}</TableCell>
              <TableCell>{t.importExport}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box p={3} width={350}>
          <h3>Nouveau Trajet</h3>
          <TextField label="Départ" name="depart" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Arrivée" name="arrivee" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField type="date" name="date" fullWidth margin="normal" onChange={handleInputChange} />

          <Select
            fullWidth name="chauffeur" value={form.chauffeur} onChange={handleSelectChange}
            displayEmpty sx={{ mt: 2 }}
          >
            <MenuItem value="">Sélectionner chauffeur</MenuItem>
            {chauffeurs.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
            ))}
          </Select>

          <Select
            fullWidth name="vehicule" value={form.vehicule} onChange={handleSelectChange}
            displayEmpty sx={{ mt: 2 }}
          >
            <MenuItem value="">Sélectionner véhicule</MenuItem>
            {vehicules.map(v => (
              <MenuItem key={v._id} value={v._id}>{v.matricule}</MenuItem>
            ))}
          </Select>

          <TextField label="Distance (km)" type="number" name="distanceKm" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Consommation (L)" type="number" name="consommationL" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Consommation (MAD)" type="number" name="consommationMAD" fullWidth margin="normal" onChange={handleInputChange} />

          <Select
            fullWidth name="partenaire" value={form.partenaire || ''} onChange={handleSelectChange}
            displayEmpty sx={{ mt: 2 }}
          >
            <MenuItem value="">Sélectionner partenaire</MenuItem>
            {partenaires.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>
            ))}
          </Select>

          <Box mt={2}>
            <FormControlLabel
              control={<Checkbox checked={form.importExport === 'import'} onChange={() => setForm({ ...form, importExport: 'import' })} />}
              label="Import"
            />
            <FormControlLabel
              control={<Checkbox checked={form.importExport === 'export'} onChange={() => setForm({ ...form, importExport: 'export' })} />}
              label="Export"
            />
          </Box>

          <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
            Enregistrer
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TrajetsPage;