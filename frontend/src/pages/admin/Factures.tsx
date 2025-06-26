import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, Pagination, Divider, IconButton, Chip, Snackbar, Alert,
} from '@mui/material';
import { PictureAsPdf, Delete, AddCircle } from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';
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

const FacturesPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [filters, setFilters] = useState({ client: '', date: '' });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'montant'>('date');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const perPage = 5;

  useEffect(() => {
    axios.get(`${API}/factures`).then(res => setFactures(res.data));
  }, []);

  const deleteFacture = async (id: string) => {
    await axios.delete(`${API}/factures/${id}`);
    setFactures(prev => prev.filter(f => f._id !== id));
    setSnack({ open: true, message: 'Facture supprimée', severity: 'success' });
  };

  const toggleStatutPayee = async (facture: Facture) => {
    const updated = { ...facture, payee: !facture.payee };
    await axios.put(`${API}/factures/${facture._id}`, updated);
    setFactures(prev => prev.map(f => f._id === facture._id ? updated : f));
  };

  const exportToExcel = () => {
    const data = factures.map(f => ({
      Numéro: f.numero,
      Client: f.client,
      Date: f.date,
      Total: f.totalTTC,
      Statut: f.payee ? 'Payée' : 'Impayée'
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Factures');
    XLSX.writeFile(workbook, 'factures.xlsx');
  };

  const filtered = factures.filter(f =>
    f.client.toLowerCase().includes(filters.client.toLowerCase()) &&
    f.date.includes(filters.date)
  );

  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'date'
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : b.totalTTC - a.totalTTC
  );

  const today = new Date().toISOString().split('T')[0];
  const facturesToday = sorted.filter(f => f.date === today);
  const facturesArchive = sorted.filter(f => f.date !== today);

  const paginatedToday = facturesToday.slice((page - 1) * perPage, page * perPage);
  const paginatedArchive = facturesArchive.slice((page - 1) * perPage, page * perPage);

  const totalTTCGlobal = factures.reduce((sum, f) => sum + f.totalTTC, 0);
  const nombreFactures = factures.length;

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="#001447">
            📊 {nombreFactures} factures — Total : {totalTTCGlobal.toFixed(2)} DH
          </Typography>
          <Button startIcon={<AddCircle />} variant="contained" onClick={exportToExcel}>
            Exporter Excel
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <TextField label="Client" variant="outlined" size="small" value={filters.client} onChange={e => setFilters({ ...filters, client: e.target.value })} />
          <TextField label="Date" type="date" variant="outlined" size="small" InputLabelProps={{ shrink: true }} value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
          <Select size="small" value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'montant')}>
            <MenuItem value="date">Trier par Date</MenuItem>
            <MenuItem value="montant">Trier par Montant</MenuItem>
          </Select>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, backgroundColor: 'white', mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>📅 Factures d'aujourd'hui</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                <TableCell>Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Télécharger</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedToday.map(f => (
                <TableRow key={f._id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Chip label={f.payee ? 'Payée' : 'Impayée'} color={f.payee ? 'success' : 'warning'} variant="outlined" onClick={() => toggleStatutPayee(f)} sx={{ cursor: 'pointer' }} />
                  </TableCell>
                  <TableCell>
                    <Button startIcon={<PictureAsPdf />} variant="outlined" size="small" onClick={() => window.open(`${API!.replace('/api', '')}${f.pdfPath}`, '_blank')}>PDF</Button>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => deleteFacture(f._id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>📦 Archives des Factures</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                <TableCell>Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Télécharger</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedArchive.map(f => (
                <TableRow key={f._id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Chip label={f.payee ? 'Payée' : 'Impayée'} color={f.payee ? 'success' : 'warning'} variant="outlined" onClick={() => toggleStatutPayee(f)} sx={{ cursor: 'pointer' }} />
                  </TableCell>
                  <TableCell>
                    <Button startIcon={<PictureAsPdf />} variant="outlined" size="small" onClick={() => window.open(`${API!.replace('/api', '')}${f.pdfPath}`, '_blank')}>PDF</Button>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => deleteFacture(f._id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(sorted.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
        </Box>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity as any} sx={{ width: '100%' }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default FacturesPage;
