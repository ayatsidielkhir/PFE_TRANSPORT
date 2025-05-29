import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Drawer, Typography, MenuItem, Select,
  FormControl, InputLabel, Pagination, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, PictureAsPdf, GridOn } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

interface Charge {
  _id?: string;
  type: string;
  montant: number;
  date: string;
  statut: 'Payé' | 'Non payé';
  chauffeur?: Chauffeur;
  notes?: string;
}

const ChargesPage: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chauffeurSelectionne, setChauffeurSelectionne] = useState<Chauffeur | null>(null);

  const [form, setForm] = useState<Charge>({
    type: '',
    montant: 0,
    date: '',
    statut: 'Non payé',
    notes: ''
  });
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
    try {
      const res = await axios.get('/api/chauffeurs');
      setChauffeurs(res.data);
    } catch (err) {
      console.error('Erreur chargement chauffeurs', err);
    }
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
    setForm({ type: '', montant: 0, date: '', statut: 'Non payé', notes: '' });
    setChauffeurSelectionne(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (charge: Charge) => {
    setForm(charge);
    setChauffeurSelectionne(charge.chauffeur || null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      chauffeur: chauffeurSelectionne?._id || undefined
    };

    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/charges/${form._id}`, payload)
        : await axios.post('/api/charges', payload);
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
      head: [['Type', 'Montant', 'Date', 'Statut', 'Chauffeur', 'Notes']],
      body: filteredCharges.map(c => [
        c.type,
        c.montant.toFixed(2),
        new Date(c.date).toLocaleDateString(),
        c.statut,
        c.chauffeur ? `${c.chauffeur.nom} ${c.chauffeur.prenom}` : '—',
        c.notes || ''
      ]),
    });
    doc.save('charges.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCharges.map(c => ({
      Type: c.type,
      Montant: c.montant,
      Date: new Date(c.date).toLocaleDateString(),
      Statut: c.statut,
      Chauffeur: c.chauffeur ? `${c.chauffeur.nom} ${c.chauffeur.prenom}` : '—',
      Notes: c.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
    XLSX.writeFile(wb, 'charges.xlsx');
  };

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Gestion des Charges
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ backgroundColor: '#001e61', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}
          >
            Ajouter une charge
          </Button>
        </Box>

        <Box mb={2} display="flex" flexWrap="wrap" gap={2}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel>Type</InputLabel>
            <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
              <MenuItem value="">Tous</MenuItem>
              {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatut} label="Statut" onChange={e => setFilterStatut(e.target.value)}>
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="Payé">Payé</MenuItem>
              <MenuItem value="Non payé">Non payé</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Date de début" type="date" size="small" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          <TextField label="Date de fin" type="date" size="small" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button size="small" onClick={() => { setFilterType(''); setFilterStatut(''); setFilterDateFrom(''); setFilterDateTo(''); }}>Réinitialiser</Button>
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPDF}>Exporter PDF</Button>
          <Button variant="outlined" startIcon={<GridOn />} onClick={exportExcel}>Exporter Excel</Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                {['Type', 'Montant', 'Date', 'Statut', 'Chauffeur', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCharges.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.montant.toFixed(2)} MAD</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 10, fontSize: 12, fontWeight: 'bold', color: 'white', backgroundColor: c.statut === 'Payé' ? '#2e7d32' : '#d32f2f' }}>{c.statut}</Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={c.notes || ''}>
                      <span>{c.chauffeur ? `${c.chauffeur.nom} ${c.chauffeur.prenom}` : '—'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)} sx={{ color: '#001e61' }}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c._id)} sx={{ color: '#d32f2f' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={Math.ceil(filteredCharges.length / 5)} color="primary" />
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={2}>{isEditing ? 'Modifier' : 'Ajouter'} une charge</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select value={form.type} onChange={(e) => handleChange('type', e.target.value)} label="Type">
                {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {['Salaire', 'CNSS'].includes(form.type) && (
              <Autocomplete
                options={chauffeurs}
                getOptionLabel={(c: Chauffeur) => `${c.nom} ${c.prenom}`}
                value={chauffeurSelectionne}
                onChange={(_, value) => setChauffeurSelectionne(value)}
                renderInput={(params) => <TextField {...params} label="Chauffeur" margin="normal" />}
              />
            )}
            <TextField label="Montant (MAD)" type="number" value={form.montant} onChange={(e) => handleChange('montant', parseFloat(e.target.value))} fullWidth margin="normal" />
            <TextField label="Date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Statut</InputLabel>
              <Select value={form.statut} onChange={(e) => handleChange('statut', e.target.value)} label="Statut">
                <MenuItem value="Payé">Payé</MenuItem>
                <MenuItem value="Non payé">Non payé</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes" value={form.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} fullWidth margin="normal" />
            <Button variant="contained" fullWidth onClick={handleSave} sx={{ mt: 2, backgroundColor: '#001e61', textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#001447' } }}>
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChargesPage;