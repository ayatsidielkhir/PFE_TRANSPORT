import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Drawer, Typography, MenuItem, Select,
  FormControl, InputLabel, Pagination
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

  const [form, setForm] = useState<Charge>({
    type: '',
    montant: 0,
    date: '',
    statut: 'Non payé',
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

    doc.save('charges.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCharges.map(c => ({
      Type: c.type,
      Montant: c.montant,
      Date: new Date(c.date).toLocaleDateString(),
      Statut: c.statut,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
    XLSX.writeFile(wb, 'charges.xlsx');
  };

  return (
    <AdminLayout>
      <Box p={3}>
        {/* boutons haut */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Gestion des Charges</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Ajouter</Button>
        </Box>

        {/* filtres */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} size="small">
              <MenuItem value="">Tous</MenuItem>
              {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select label="Statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} size="small">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="Payé">Payé</MenuItem>
              <MenuItem value="Non payé">Non payé</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Date de début" type="date" InputLabelProps={{ shrink: true }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} size="small" />
          <TextField label="Date de fin" type="date" InputLabelProps={{ shrink: true }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} size="small" />

          <Button variant="outlined" onClick={() => { setFilterType(''); setFilterStatut(''); setFilterDateFrom(''); setFilterDateTo(''); }}>
            Réinitialiser
          </Button>
        </Box>

        {/* export boutons */}
        <Box mb={2} display="flex" gap={2}>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportPDF}>Exporter PDF</Button>
          <Button variant="outlined" startIcon={<GridOn />} onClick={exportExcel}>Exporter Excel</Button>
        </Box>

        {/* tableau */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
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
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.montant.toFixed(2)} MAD</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  <TableCell>{c.statut}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCharges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Aucune charge trouvée</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* formulaire Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box mt={8} p={3} width={400}>
            <Typography variant="h6" mb={2}>{isEditing ? 'Modifier une charge' : 'Ajouter une charge'}</Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Type"
              >
                {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {['Salaire', 'CNSS'].includes(form.type) && (
              <Autocomplete
                options={chauffeurs}
                getOptionLabel={(option: Chauffeur) => `${option.nom} ${option.prenom}`}
                value={chauffeurSelectionne}
                onChange={(_: React.SyntheticEvent, newValue: Chauffeur | null) => {
                  setChauffeurSelectionne(newValue);
                }}
                renderInput={(params: any) => (
                  <TextField {...params} label="Choisir Chauffeur" margin="normal" fullWidth />
                )}
              />
            )}

            <TextField
              label="Montant (MAD)"
              type="number"
              value={form.montant}
              onChange={(e) => handleChange('montant', parseFloat(e.target.value))}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Statut</InputLabel>
              <Select
                value={form.statut}
                onChange={(e) => handleChange('statut', e.target.value)}
                label="Statut"
              >
                <MenuItem value="Payé">Payé</MenuItem>
                <MenuItem value="Non payé">Non payé</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" fullWidth onClick={handleSave} sx={{ mt: 2 }}>
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChargesPage;