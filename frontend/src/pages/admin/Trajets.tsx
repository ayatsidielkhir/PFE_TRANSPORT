import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Select, MenuItem, SelectChangeEvent
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

interface Trajet {
  _id?: string;
  depart: string;
  arrivee: string;
  date: string;
  chauffeur: string;
  vehicule: string;
  distanceKm: number;
  consommationL: number;
}

const TrajetsPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Trajet>({
    depart: '', arrivee: '', date: '', chauffeur: '', vehicule: '', distanceKm: 0, consommationL: 0,
  });

  const fetchData = async () => {
    try {
      const [trajetRes, chaufRes, vehicRes] = await Promise.all([
        axios.get('http://localhost:5000/api/trajets'),
        axios.get('http://localhost:5000/api/chauffeurs'),
        axios.get('http://localhost:5000/api/vehicules')
      ]);
      setTrajets(trajetRes.data);
      setChauffeurs(chaufRes.data);
      setVehicules(vehicRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <h2>Trajets</h2>
        <Button variant="contained" color="primary" onClick={() => setDrawerOpen(true)}>
          Nouveau trajet
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Itinéraire</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Chauffeur</TableCell>
            <TableCell>Véhicule</TableCell>
            <TableCell>Distance</TableCell>
            <TableCell>Consommation</TableCell>
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
            fullWidth
            name="chauffeur"
            value={form.chauffeur}
            onChange={handleSelectChange}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Sélectionner chauffeur</MenuItem>
            {chauffeurs.length > 0 ? chauffeurs.map(c => (
              <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
            )) : <MenuItem disabled>Aucun chauffeur disponible</MenuItem>}
          </Select>

          <Select
            fullWidth
            name="vehicule"
            value={form.vehicule}
            onChange={handleSelectChange}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Sélectionner véhicule</MenuItem>
            {vehicules.length > 0 ? vehicules.map(v => (
              <MenuItem key={v._id} value={v._id}>{v.matricule}</MenuItem>
            )) : <MenuItem disabled>Aucun véhicule disponible</MenuItem>}
          </Select>

          <TextField label="Distance (km)" type="number" name="distanceKm" fullWidth margin="normal" onChange={handleInputChange} />
          <TextField label="Consommation (L)" type="number" name="consommationL" fullWidth margin="normal" onChange={handleInputChange} />

          <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
            Enregistrer
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default TrajetsPage;
