import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, Pagination, useMediaQuery, Divider
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

const API = process.env.REACT_APP_API_URL;
interface Facture {
  _id: string;
  numero: string;
  client: string;
  date: string;
  totalTTC: number;
  pdfPath: string;
  payee?: boolean;
}

interface Trajet {
  _id: string;
  depart: string;
  arrivee: string;
  date: string;
  vehicule: {
    matricule: string;
  };
  partenaire: {
    _id: string;
    nom: string;
    ice: string;
  };
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
    totalHT: 0,
    tva: 10,
  });
  const [filters, setFilters] = useState({ client: '', date: '' });
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    axios.get(`${API}/trajets`).then(res => {
      const data = res.data.map((t: any) => ({
        ...t,
        partenaire: t.partenaire || { nom: '', ice: '' },
        vehicule: typeof t.vehicule === 'object' ? t.vehicule : { matricule: t.vehicule }
      }));
      setTrajets(data);
    });
    axios.get(`${API}/factures`).then(res => setFactures(res.data));
  }, []);

  const handleTrajetSelect = (id: string) => {
    const t = trajets.find(t => t._id === id);
    if (t) {
      setSelectedTrajet(t);
      setFormData(prev => ({
        ...prev,
        numeroFacture: '001/2025',
        client: t.partenaire.nom,
        ice: t.partenaire.ice, // ✅ Récupération correcte de l'ICE
        tracteur: t.vehicule.matricule,
        date: t.date,
        chargement: t.depart,
        dechargement: t.arrivee,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalHT' || name === 'tva' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleGeneratePDF = async () => {
    const totalTTC = formData.totalHT * (1 + formData.tva / 100);
    const res = await axios.post(`${API}/factures/manual`, {
      ...formData,
      trajetId: selectedTrajet?._id,
      totalTTC,
    });
    alert("Facture générée avec succès");
    setFactures(prev => [
      ...prev,
      {
        ...formData,
        _id: '',
        totalTTC,
        pdfPath: res.data.url,
        numero: formData.numeroFacture,
        payee: false
      }
    ]);
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

        <Paper elevation={2} sx={{ p: 3, mb: 5, borderRadius: 3, backgroundColor: '#f3f6f9' }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>➕ Ajouter une nouvelle facture</Typography>

          <Box display="flex" flexWrap="wrap" gap={2}>
            <Select fullWidth value={selectedTrajet?._id || ''} onChange={(e) => handleTrajetSelect(e.target.value)} sx={{ flex: '1 1 100%' }}>
              <MenuItem value="">Sélectionner un trajet</MenuItem>
              {trajets.map(t => (
                <MenuItem key={t._id} value={t._id}>{`${t.depart} – ${t.arrivee} (${t.date})`}</MenuItem>
              ))}
            </Select>

            {["numeroFacture", "client", "ice", "date", "chargement", "dechargement", "tracteur", "totalHT", "tva"].map((field) => (
              <TextField
                key={field}
                label={
                  field === "numeroFacture" ? "Facture N°" :
                  field === "totalHT" ? "Total HT" :
                  field === "tva" ? "TVA (%)" :
                  field.charAt(0).toUpperCase() + field.slice(1)
                }
                name={field}
                type={["totalHT", "tva"].includes(field) ? "number" : "text"}
                value={(formData as any)[field]}
                onChange={handleChange}
                InputProps={{
                  readOnly: ["client", "ice", "date", "chargement", "dechargement"].includes(field)
                }}
                fullWidth
                sx={{ flex: '1 1 30%' }}
              />
            ))}

            <Button variant="contained" onClick={handleGeneratePDF} sx={{ flex: '1 1 100%', mt: 1, fontWeight: 'bold' }}>
              Générer PDF
            </Button>
          </Box>

          <Paper sx={{ mt: 3, p: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Récapitulatif Montants</Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 30%"><Typography>Total HT</Typography><Typography fontWeight="bold">{formData.totalHT.toFixed(2)} DH</Typography></Box>
              <Box flex="1 1 30%"><Typography>TVA {formData.tva}%</Typography><Typography fontWeight="bold">{(formData.totalHT * (formData.tva / 100)).toFixed(2)} DH</Typography></Box>
              <Box flex="1 1 30%"><Typography>Total TTC</Typography><Typography fontWeight="bold">{(formData.totalHT * (1 + formData.tva / 100)).toFixed(2)} DH</Typography></Box>
            </Box>
          </Paper>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>📜 Historique des Factures</Typography>
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
