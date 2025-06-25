import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, InputAdornment, Pagination, useMediaQuery,
  Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Add, PictureAsPdf, Search } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import * as XLSX from 'xlsx';

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
    numeroFacture: '', client: '', ice: '', tracteur: '', date: '', chargement: '', dechargement: '', totalHT: 0
  });
  const [filters, setFilters] = useState({ client: '', date: '', status: '' });
  const [page, setPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const perPage = 5;
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/trajets`).then(res => setTrajets(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/factures`).then(res => setFactures(res.data));
  }, []);

  const handleTrajetSelect = (id: string) => {
    const t = trajets.find(t => t._id === id);
    if (t) {
      setSelectedTrajet(t);
      setFormData({
        numeroFacture: '001/2025', client: '', ice: '', tracteur: '', date: t.date,
        chargement: t.depart, dechargement: t.arrivee, totalHT: 0
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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(factures);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factures");
    XLSX.writeFile(workbook, "factures.xlsx");
  };

  const filtered = factures.filter(f =>
    f.client.toLowerCase().includes(filters.client.toLowerCase()) &&
    f.date.includes(filters.date) &&
    (filters.status ? f.payee === (filters.status === 'payee') : true)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3}>Gestion des Factures</Typography>

        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems="center">
            <TextField
              placeholder="Rechercher un client..."
              size="small"
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
              sx={{ flex: 1, backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Filtrer par date"
              type="date"
              size="small"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, backgroundColor: 'white', borderRadius: 1 }}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
              displayEmpty
              sx={{ flex: 1, backgroundColor: 'white', borderRadius: 1 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="payee">Payées</MenuItem>
              <MenuItem value="impayee">Impayées</MenuItem>
            </Select>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleGeneratePDF}
              sx={{ backgroundColor: '#001e61', textTransform: 'none', fontWeight: 'bold', borderRadius: 3 }}
            >
              Générer Facture
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportExcel}
              sx={{ borderRadius: 3 }}
            >
              Exporter Excel
            </Button>
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
                    <Button
                      size="small"
                      variant={f.payee ? 'contained' : 'outlined'}
                      color={f.payee ? 'success' : 'warning'}
                      onClick={() => toggleStatutPayee(f)}
                    >{f.payee ? 'Payée' : 'Impayée'}</Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<PictureAsPdf />}
                      variant="outlined"
                      size="small"
                      onClick={() => setPdfUrl(`${process.env.REACT_APP_API_URL!.replace('/api', '')}${f.pdfPath}`)}
                    >PDF</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
          </Box>
        </Paper>

        <Dialog open={!!pdfUrl} onClose={() => setPdfUrl(null)} maxWidth="lg" fullWidth>
          <DialogTitle>Visualisation Facture</DialogTitle>
          <DialogContent>
            <iframe src={pdfUrl || ''} width="100%" height="600px" style={{ border: 'none' }} />
            <Box mt={2} textAlign="right">
              <Button onClick={() => window.open(pdfUrl || '', '_blank')} variant="outlined">Télécharger</Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default FacturesPage;
