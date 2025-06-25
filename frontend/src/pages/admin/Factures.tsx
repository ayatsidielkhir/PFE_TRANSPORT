import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, InputAdornment, Pagination, useMediaQuery
} from '@mui/material';
import { Add, PictureAsPdf, Search } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

const API = process.env.REACT_APP_API_URL;

interface Trajet {
  _id: string;
  depart: string;
  arrivee: string;
  date: string;
  vehicule: string;
  partenaire: {
    _id: string;
    nom: string;
    ice?: string;
  };
}

interface Facture {
  _id: string;
  numero: string;
  client: string;
  date: string;
  totalTTC: number;
  pdfPath: string;
  payee?: boolean;
}

const FacturesPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [selectedTrajet, setSelectedTrajet] = useState<Trajet | null>(null);
  const [formData, setFormData] = useState({
    numeroFacture: '', client: '', ice: '', tracteur: '', date: '', chargement: '', dechargement: '', totalHT: 0
  });
  const [filters, setFilters] = useState({ client: '', date: '' });
  const [page, setPage] = useState(1);
  const perPage = 5;
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    axios.get(`${API}/trajets`).then(res => setTrajets(res.data));
    axios.get(`${API}/factures`).then(res => setFactures(res.data));
  }, []);

  const handleTrajetSelect = (id: string) => {
    const t = trajets.find(t => t._id === id);
    if (t) {
      setSelectedTrajet(t);
      setFormData({
        numeroFacture: '001/2025',
        client: t.partenaire?.nom || '',
        ice: t.partenaire?.ice || '',
        tracteur: t.vehicule,
        date: t.date,
        chargement: t.depart,
        dechargement: t.arrivee,
        totalHT: 0
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePDF = async () => {
    const res = await axios.post(`${API}/factures/manual`, {
      ...formData,
      trajetId: selectedTrajet?._id
    });
    alert("Facture générée avec succès");
    setFactures(prev => [...prev, {
      ...formData,
      _id: '',
      totalTTC: formData.totalHT * 1.1,
      pdfPath: res.data.url,
      numero: formData.numeroFacture,
      payee: false
    }]);
  };

  const toggleStatutPayee = async (facture: Facture) => {
    const updated = { ...facture, payee: !facture.payee };
    await axios.put(`${API}/factures/${facture._id}`, updated);
    setFactures(factures.map(f => f._id === facture._id ? updated : f));
  };

  const filtered = factures.filter(f =>
    f.client.toLowerCase().includes(filters.client.toLowerCase()) &&
    f.date.includes(filters.date)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3}>Gestion des Factures</Typography>

        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems="center">
            <Select fullWidth value={selectedTrajet?._id || ''} onChange={(e) => handleTrajetSelect(e.target.value)}>
              <MenuItem value="">Sélectionner un trajet</MenuItem>
              {trajets.map(t => (
                <MenuItem key={t._id} value={t._id}>{`${t.depart} – ${t.arrivee} (${t.date})`}</MenuItem>
              ))}
            </Select>
            <TextField label="Facture N°" name="numeroFacture" value={formData.numeroFacture} onChange={handleChange} fullWidth />
            <TextField label="Client" name="client" value={formData.client} disabled fullWidth />
            <TextField label="ICE" name="ice" value={formData.ice} disabled fullWidth />
            <TextField label="Tracteur" name="tracteur" value={formData.tracteur} onChange={handleChange} fullWidth />
            <TextField label="Total HT (DH)" name="totalHT" value={formData.totalHT} onChange={handleChange} type="number" fullWidth />
            <Button variant="contained" onClick={handleGeneratePDF}>Générer PDF</Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                <TableCell>Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Télécharger</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(f => (
                <TableRow key={f._id || f.numero}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Button size="small" variant={f.payee ? 'contained' : 'outlined'} color={f.payee ? 'success' : 'warning'} onClick={() => toggleStatutPayee(f)}>
                      {f.payee ? 'Payée' : 'Impayée'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button startIcon={<PictureAsPdf />} variant="outlined" size="small" onClick={() => window.open(`${API!.replace('/api', '')}${f.pdfPath}`, '_blank')}>
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
          </Box>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default FacturesPage;
