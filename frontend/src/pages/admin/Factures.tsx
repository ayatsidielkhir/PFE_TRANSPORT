// ✅ FacturesPage.tsx – Génération de factures, liste avec filtre et statut payé
import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import axios from 'axios';

interface Trajet {
  _id: string;
  depart: string;
  arrivee: string;
  date: string;
  vehicule: string;
  partenaire: string;
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
    numeroFacture: '',
    client: '',
    ice: '',
    tracteur: '',
    date: '',
    chargement: '',
    dechargement: '',
    totalHT: 0
  });
  const [filters, setFilters] = useState({ client: '', date: '' });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/trajets`).then(res => setTrajets(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/factures`).then(res => setFactures(res.data));
  }, []);

  const handleTrajetSelect = (trajetId: string) => {
    const t = trajets.find(t => t._id === trajetId);
    if (t) {
      setSelectedTrajet(t);
      setFormData({
        numeroFacture: '001/2025',
        client: '',
        ice: '',
        tracteur: '',
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
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/factures/manual`, {
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
    await axios.put(`${process.env.REACT_APP_API_URL}/factures/${facture._id}`, updated);
    setFactures(factures.map(f => f._id === facture._id ? updated : f));
  };

  const filteredFactures = factures.filter(f =>
    f.client.toLowerCase().includes(filters.client.toLowerCase()) &&
    f.date.includes(filters.date)
  );

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>Génération de Factures</Typography>
      <Box display="flex" gap={4} flexWrap="wrap">
        <Paper elevation={2} sx={{ p: 2, width: '300px' }}>
          <Typography variant="subtitle1" mb={2}>Sélectionner un trajet</Typography>
          <Select fullWidth value={selectedTrajet?._id || ''} onChange={(e) => handleTrajetSelect(e.target.value)}>
            {trajets.map(t => (
              <MenuItem key={t._id} value={t._id}>{`${t.depart} – ${t.arrivee} (${t.date})`}</MenuItem>
            ))}
          </Select>
          <TextField label="Facture N°" name="numeroFacture" value={formData.numeroFacture} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <TextField label="Client" name="client" value={formData.client} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <TextField label="ICE" name="ice" value={formData.ice} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <TextField label="Tracteur" name="tracteur" value={formData.tracteur} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <TextField label="Total HT (DH)" name="totalHT" value={formData.totalHT} onChange={handleChange} type="number" fullWidth sx={{ mt: 2 }} />
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleGeneratePDF}>Générer PDF</Button>
        </Paper>

        <Paper elevation={2} sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" mb={2}>Factures générées</Typography>

          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Filtrer par client"
              size="small"
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            />
            <TextField
              label="Filtrer par date"
              type="date"
              size="small"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Télécharger</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactures.map(f => (
                <TableRow key={f._id || f.numero}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant={f.payee ? 'contained' : 'outlined'}
                      color={f.payee ? 'success' : 'warning'}
                      onClick={() => toggleStatutPayee(f)}
                    >{f.payee ? 'Payée' : 'Impayée'}</Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL}${f.pdfPath}`, '_blank')}
                    >PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
};

export default FacturesPage;