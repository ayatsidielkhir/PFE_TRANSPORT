import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Drawer, Typography, MenuItem, Select,
  FormControl, InputLabel, Chip, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, PictureAsPdf, GridOn } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Charge {
  _id?: string;
  type: string;
  montant: number;
  date: string;
  statut: 'Payé' | 'Non payé';
}

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

const ChargesPage: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chauffeurSelectionne, setChauffeurSelectionne] = useState<Chauffeur | null>(null);
  const [form, setForm] = useState<Charge>({ type: '', montant: 0, date: '', statut: 'Non payé' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    fetchCharges();
    fetchChauffeurs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [charges, filterType, filterStatut, filterDateFrom, filterDateTo]);

  const fetchCharges = async () => {
    const res = await axios.get('/api/charges');
    setCharges(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/api/chauffeurs');
    setChauffeurs(res.data);
  };

  const applyFilters = () => {
    let filtered = [...charges];
    if (filterType) filtered = filtered.filter(c => c.type === filterType);
    if (filterStatut) filtered = filtered.filter(c => c.statut === filterStatut);
    if (filterDateFrom) filtered = filtered.filter(c => new Date(c.date) >= new Date(filterDateFrom));
    if (filterDateTo) filtered = filtered.filter(c => new Date(c.date) <= new Date(filterDateTo));
    setFilteredCharges(filtered);
  };

  const handleChange = (field: keyof Charge, value: any) => {
    setForm({ ...form, [field]: value });
    if (field === 'type' && !['Salaire', 'CNSS'].includes(value)) {
      setChauffeurSelectionne(null);
    }
  };

  const handleAdd = () => {
    setForm({ type: '', montant: 0, date: '', statut: 'Non payé' });
    setChauffeurSelectionne(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (charge: Charge) => {
    setForm(charge);
    setChauffeurSelectionne(null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/charges/${form._id}`, form)
        : await axios.post('/api/charges', form);
      if ([200, 201].includes(res.status)) {
        fetchCharges();
        setDrawerOpen(false);
      }
    } catch {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm("Supprimer cette charge ?")) {
      await axios.delete(`/api/charges/${id}`);
      fetchCharges();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Charges", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['Type', 'Montant (MAD)', 'Date', 'Statut']],
      body: filteredCharges.map(c => [
        c.type,
        c.montant.toFixed(2),
        new Date(c.date).toLocaleDateString(),
        c.statut,
      ]),
    });
    const total = filteredCharges.reduce((sum, c) => sum + c.montant, 0);
    if (doc.lastAutoTable?.finalY) {
      doc.text(`Total : ${total.toFixed(2)} MAD`, 14, doc.lastAutoTable.finalY + 10);
    }
    doc.save('charges.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCharges.map(c => ({
      Type: c.type,
      Montant: c.montant,
      Date: new Date(c.date).toLocaleDateString(),
      Statut: c.statut
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
    XLSX.writeFile(wb, 'charges.xlsx');
  };

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">Gestion des Charges</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', backgroundColor: '#001e61', '&:hover': { backgroundColor: '#00184a' } }}
            onClick={handleAdd}
          >
            Ajouter Charge
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} size="small">
              <MenuItem value="">Tous</MenuItem>
              {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Statut</InputLabel>
            <Select label="Statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} size="small">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="Payé">Payé</MenuItem>
              <MenuItem value="Non payé">Non payé</MenuItem>
            </Select>
          </FormControl>

          <TextField type="date" label="Début" InputLabelProps={{ shrink: true }} size="small" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <TextField type="date" label="Fin" InputLabelProps={{ shrink: true }} size="small" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />

          <Button onClick={() => { setFilterType(''); setFilterStatut(''); setFilterDateFrom(''); setFilterDateTo(''); }}>
            Réinitialiser
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <Button variant="contained" startIcon={<PictureAsPdf />} onClick={exportPDF} sx={{ borderRadius: 3, textTransform: 'none', backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}>Exporter PDF</Button>
          <Button variant="contained" startIcon={<GridOn />} onClick={exportExcel} sx={{ borderRadius: 3, textTransform: 'none', backgroundColor: '#388e3c', '&:hover': { backgroundColor: '#2e7d32' } }}>Exporter Excel</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f1f1' }}>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Montant</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCharges.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.montant.toFixed(2)} MAD</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.statut}
                      sx={{
                        backgroundColor: c.statut === 'Payé' ? '#c8e6c9' : '#ffcdd2',
                        color: c.statut === 'Payé' ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>{isEditing ? 'Modifier' : 'Ajouter'} une Charge</Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select value={form.type} onChange={e => handleChange('type', e.target.value)} label="Type">
                {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {['Salaire', 'CNSS'].includes(form.type) && (
              <Autocomplete
                options={chauffeurs}
                getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                value={chauffeurSelectionne}
                onChange={(_, newValue) => setChauffeurSelectionne(newValue)}
                renderInput={(params) => <TextField {...params} label="Chauffeur" margin="normal" />}
              />
            )}

            <TextField label="Montant (MAD)" type="number" fullWidth margin="normal" value={form.montant} onChange={e => handleChange('montant', parseFloat(e.target.value))} />
            <TextField type="date" label="Date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={form.date} onChange={e => handleChange('date', e.target.value)} />

            <FormControl fullWidth margin="normal">
              <InputLabel>Statut</InputLabel>
              <Select value={form.statut} onChange={e => handleChange('statut', e.target.value)} label="Statut">
                <MenuItem value="Payé">Payé</MenuItem>
                <MenuItem value="Non payé">Non payé</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" fullWidth sx={{ mt: 2, borderRadius: 3 }} onClick={handleSave}>
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChargesPage;
