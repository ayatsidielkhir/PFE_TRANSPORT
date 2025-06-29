// ✅ FacturesPage.tsx – Version complète stylisée et fonctionnelle
import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, Pagination, IconButton, Tooltip, Snackbar,
  Alert, Drawer, Fab, Chip
} from '@mui/material';
import {
  PictureAsPdf, Delete, FileDownload, Add, Edit, ReceiptLong,
  Paid, QueryBuilder, AttachMoney
} from '@mui/icons-material';
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
  trajetIds?: string[];
}

interface Trajet {
  _id: string;
  depart: string;
  arrivee: string;
  date: string;
  vehicule: { matricule: string };
  partenaire: { _id: string; nom: string; ice: string };
}

const FacturesPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [selectedTrajets, setSelectedTrajets] = useState<Trajet[]>([]);
  const [formData, setFormData] = useState({
    numeroFacture: '', client: '', ice: '', tracteur: '',
    date: new Date().toISOString().slice(0, 10), tva: 10,
    montantsHT: [] as number[], remorques: [] as string[]
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ client: '', date: '' });
  const [page, setPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const perPage = 5;
  const usedTrajetIds = new Set(factures.flatMap(f => f.trajetIds || []));

  useEffect(() => {
    axios.get(`${API}/trajets`).then(res => {
      const data = res.data.map((t: any) => ({
        ...t,
        partenaire: t.partenaire || { nom: '', ice: '' },
        vehicule: typeof t.vehicule === 'object' ? t.vehicule : { matricule: t.vehicule }
      }));
      setTrajets(data);
    });
    axios.get(`${API}/factures`).then(res => {
      setFactures(res.data);
      const nums = res.data.map((f: Facture) => parseInt(f.numero)).filter(Boolean);
      const next = Math.max(...nums, 0) + 1;
      setFormData(prev => ({ ...prev, numeroFacture: `${next.toString().padStart(3, '0')}/2025` }));
    });
  }, []);

  const handleMultipleTrajetSelect = (ids: string[]) => {
    const selected = trajets.filter(t => ids.includes(t._id));
    setSelectedTrajets(selected);
    if (selected.length > 0) {
      const t = selected[0];
      setFormData(prev => ({
        ...prev,
        client: t.partenaire.nom,
        ice: t.partenaire.ice,
        tracteur: t.vehicule.matricule,
        date: t.date,
        montantsHT: selected.map(() => 0),
        remorques: selected.map(() => '')
      }));
    }
  };

  const handleFormDataChange = (index: number, field: 'montantsHT' | 'remorques', value: string | number) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const removeTrajet = (index: number) => {
    const updatedTrajets = [...selectedTrajets];
    updatedTrajets.splice(index, 1);
    const montants = [...formData.montantsHT];
    const remorques = [...formData.remorques];
    montants.splice(index, 1);
    remorques.splice(index, 1);
    setSelectedTrajets(updatedTrajets);
    setFormData(prev => ({ ...prev, montantsHT: montants, remorques }));
  };

  const handleGeneratePDF = async () => {
    try {
      const totalHT = formData.montantsHT.reduce((sum, m) => sum + m, 0);
      const tva = totalHT * (formData.tva / 100);
      const totalTTC = totalHT + tva;
      if (editId) {
        await axios.put(`${API}/factures/${editId}`, { ...formData, totalHT, totalTTC, trajetIds: selectedTrajets.map(t => t._id) });
        setFactures(prev => prev.map(f => f._id === editId ? { ...f, ...formData, totalTTC } : f));
      } else {
        const res = await axios.post(`${API}/factures/manual`, {
          ...formData,
          totalHT,
          totalTTC,
          trajetIds: selectedTrajets.map(t => t._id),
          remorques: formData.remorques,
          montantsHT: formData.montantsHT
        });
        setFactures(prev => [...prev, {
          ...formData,
          _id: res.data._id,
          totalTTC,
          pdfPath: res.data.url,
          numero: formData.numeroFacture,
          payee: false
        }]);
      }
      setSnackbarOpen(true);
      setDrawerOpen(false);
      setEditId(null);
    } catch (err: any) {
      alert("Erreur lors de la génération de la facture !");
      console.error(err.response?.data || err.message);
    }
  };

  const handleEdit = (facture: Facture) => {
    setEditId(facture._id);
    setFormData({
      numeroFacture: facture.numero,
      client: facture.client,
      ice: '',
      tracteur: '',
      date: facture.date,
      tva: 10,
      montantsHT: [],
      remorques: []
    });
    setDrawerOpen(true);
  };

  const exportToExcel = () => {
    const data = factures.map(f => ({ 'Facture N°': f.numero, Client: f.client, Date: f.date, 'Total TTC (DH)': f.totalTTC, Statut: f.payee ? 'Payée' : 'Impayée' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    XLSX.writeFile(wb, `factures_export_${new Date().toLocaleDateString()}.xlsx`);
  };

  const toggleStatutPayee = async (facture: Facture) => {
    const updated = { ...facture, payee: !facture.payee };
    await axios.put(`${API}/factures/${facture._id}`, updated);
    setFactures(factures.map(f => f._id === facture._id ? updated : f));
  };

  const deleteFacture = async (id: string) => {
    if (window.confirm('Supprimer cette facture ?')) {
      await axios.delete(`${API}/factures/${id}`);
      setFactures(prev => prev.filter(f => f._id !== id));
    }
  };

  const filtered = factures.filter(f => f.client.toLowerCase().includes(filters.client.toLowerCase()) && f.date.includes(filters.date));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

 return (
  <AdminLayout>
    <Box p={3} maxWidth="1400px" mx="auto">
      {/* Statistiques */}
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3} mb={4}>
        {[
          {
            label: 'Total Factures',
            value: factures.length,
            icon: <ReceiptLong sx={{ fontSize: 36, color: '#001e61' }} />,
            bg: '#e3f2fd',
          },
          {
            label: 'Montant TTC',
            value: `${factures.reduce((sum, f) => sum + (f.totalTTC || 0), 0).toFixed(2)} DH`,
            icon: <AttachMoney sx={{ fontSize: 36, color: '#001e61' }} />,
            bg: '#d0f0c0',
          },
          {
            label: 'Factures Payées',
            value: factures.filter(f => f.payee).length,
            icon: <Paid sx={{ fontSize: 36, color: '#001e61' }} />,
            bg: '#c8e6c9',
          },
          {
            label: 'Factures Impayées',
            value: factures.filter(f => !f.payee).length,
            icon: <QueryBuilder sx={{ fontSize: 36, color: '#001e61' }} />,
            bg: '#ffe0b2',
          },
        ].map((stat, i) => (
          <Paper
            key={i}
            elevation={4}
            sx={{
              p: 3,
              width: 230,
              height: 140,
              borderRadius: 4,
              background: stat.bg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transition: '0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              },
            }}
          >
            {stat.icon}
            <Typography variant="subtitle2" fontWeight="bold" color="#001e61" mt={1}>
              {stat.label}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filtres */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          borderRadius: 3
        }}
      >
        <TextField
          size="small"
          label="🔍 Client"
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          sx={{ minWidth: 220 }}
        />
        <TextField
          size="small"
          type="month"
          label="📅 Mois"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<FileDownload />}
          onClick={exportToExcel}
          sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
        >
          Exporter Excel
        </Button>
      </Paper>

      {/* Tableau */}
      <Table size="small">
        <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1 }}>
          <TableRow>
            <TableCell>Facture</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Total TTC</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
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
                <Chip
                  label={f.payee ? 'Payée' : 'Impayée'}
                  color={f.payee ? 'success' : 'warning'}
                  variant="outlined"
                  onClick={() => toggleStatutPayee(f)}
                  sx={{ cursor: 'pointer' }}
                />
              </TableCell>
              <TableCell>
                <Tooltip title="Voir PDF">
                  <IconButton color="primary" onClick={() => window.open(`${API!.replace('/api', '')}${f.pdfPath}`, '_blank')}>
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Modifier">
                  <IconButton color="warning" onClick={() => handleEdit(f)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton color="error" onClick={() => deleteFacture(f._id)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filtered.length / perPage)}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
        />
      </Box>

      {/* Bouton ajout */}
      <Fab
        color="primary"
        aria-label="Ajouter une facture"
        onClick={() => {
          setDrawerOpen(true);
          setEditId(null);
        }}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: '#001e61',
          '&:hover': { backgroundColor: '#00317a' },
          zIndex: 1000,
        }}
      >
        <Add />
      </Fab>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  <Box p={4} width={500} mx={10}>
    <Typography variant="h6" textAlign="center" fontWeight="bold" mb={3}>
      {editId ? '✏️ Modifier la facture' : '➕ Nouvelle facture'}
    </Typography>

    {/* Sélection trajets */}
    <Select
      multiple
      fullWidth
      value={selectedTrajets.map(t => t._id)}
      onChange={(e) => handleMultipleTrajetSelect(e.target.value as string[])}
      displayEmpty
      sx={{ mb: 3 }}
      renderValue={(selected) =>
        (selected as string[]).length === 0
          ? "Sélectionner des trajets"
          : selected
              .map(id => {
                const t = trajets.find(tr => tr._id === id);
                return t ? `${t.depart} ➜ ${t.arrivee}` : id;
              })
              .join(", ")
      }
    >
      {trajets
        .filter(t => !usedTrajetIds.has(t._id) || selectedTrajets.find(sel => sel._id === t._id))
        .map(t => (
          <MenuItem key={t._id} value={t._id}>
            {t.depart} ➜ {t.arrivee} ({t.date})
          </MenuItem>
        ))}
    </Select>

    {/* Champs fixes */}
    <TextField
      label="Numéro de Facture"
      fullWidth
      disabled
      value={formData.numeroFacture}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Client"
      fullWidth
      value={formData.client}
      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="ICE"
      fullWidth
      value={formData.ice}
      onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Tracteur"
      fullWidth
      value={formData.tracteur}
      onChange={(e) => setFormData({ ...formData, tracteur: e.target.value })}
      sx={{ mb: 2 }}
    />
    <TextField
      label="Date"
      type="date"
      fullWidth
      value={formData.date}
      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
      InputLabelProps={{ shrink: true }}
      sx={{ mb: 3 }}
    />

    {/* Champs dynamiques par trajet */}
    {selectedTrajets.map((trajet, index) => (
      <Box key={trajet._id} mb={3} border="1px solid #ccc" borderRadius={2} p={2} bgcolor="#f9f9f9">
        <Typography variant="subtitle2" fontWeight="bold" color="primary">
          🚚 Trajet {index + 1} : {trajet.depart} ➜ {trajet.arrivee}
        </Typography>
        <Box display="flex" gap={2} mt={1}>
          <TextField
            label="Remorque"
            value={formData.remorques[index] || ''}
            onChange={(e) => handleFormDataChange(index, 'remorques', e.target.value)}
            fullWidth
          />
          <TextField
            label="Montant HT"
            type="number"
            value={formData.montantsHT[index] || ''}
            onChange={(e) => handleFormDataChange(index, 'montantsHT', parseFloat(e.target.value))}
            sx={{ width: 150 }}
          />
        </Box>
        <Box textAlign="right" mt={1}>
          <Button size="small" color="error" onClick={() => removeTrajet(index)}>
            🗑 Supprimer
          </Button>
        </Box>
      </Box>
    ))}

    {/* Bouton final */}
    <Button
      fullWidth
      variant="contained"
      sx={{ backgroundColor: '#001e61', mt: 3, py: 1.2 }}
      onClick={handleGeneratePDF}
    >
      {editId ? 'Mettre à jour' : 'Générer la facture'}
    </Button>
  </Box>
</Drawer>


      {/* Snackbar succès */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="success" variant="filled">
          ✅ Facture {editId ? 'modifiée' : 'générée'} avec succès
        </Alert>
      </Snackbar>
    </Box>
  </AdminLayout>
);

};

export default FacturesPage;