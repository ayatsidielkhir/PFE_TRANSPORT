// Factures.tsx – avec filtrage entre factures du jour et archives

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableHead,
  TableBody, TableRow, TableCell, Pagination, Divider, Chip, Snackbar, Alert
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

const FacturesPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'today' | 'archive'>('today');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const perPage = 5;

  useEffect(() => {
    axios.get(`${API}/factures`).then(res => setFactures(res.data));
  }, []);

  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const filtered = useMemo(() =>
    factures.filter(f =>
      activeTab === 'today' ? isToday(f.date) : !isToday(f.date)
    ), [factures, activeTab]
  );

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]
  );

  const toggleStatutPayee = async (facture: Facture) => {
    const updated = { ...facture, payee: !facture.payee };
    await axios.put(`${API}/factures/${facture._id}`, updated);
    setFactures(prev => prev.map(f => f._id === facture._id ? updated : f));
  };

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1200px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3}>📜 Historique des Factures</Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button variant={activeTab === 'today' ? 'contained' : 'outlined'} onClick={() => setActiveTab('today')}>Aujourd'hui</Button>
          <Button variant={activeTab === 'archive' ? 'contained' : 'outlined'} onClick={() => setActiveTab('archive')}>Archives</Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 3, p: 3 }}>
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
              {paginated.map(f => (
                <TableRow key={f._id}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Chip label={f.payee ? 'Payée' : 'Impayée'} color={f.payee ? 'success' : 'warning'} onClick={() => toggleStatutPayee(f)} />
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

        <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}>
          <Alert severity="success">{successMsg}</Alert>
        </Snackbar>
        <Snackbar open={!!errorMsg} autoHideDuration={3000} onClose={() => setErrorMsg('')}>
          <Alert severity="error">{errorMsg}</Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
};

export default FacturesPage;