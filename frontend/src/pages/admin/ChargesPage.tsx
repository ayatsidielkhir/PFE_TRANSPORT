import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, IconButton, Drawer, Typography, MenuItem, Select,
  FormControl, InputLabel, Pagination, Chip
} from '@mui/material';
import { Add, Edit, Delete, Download } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
  chauffeur?: string | Chauffeur;
  notes?: string;
}

const ChargesPage: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chauffeurMap, setChauffeurMap] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Charge>({
    type: '', montant: 0, date: '', statut: 'Non payé', notes: ''
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [chauffeurSelectionne, setChauffeurSelectionne] = useState<Chauffeur | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchCharges();
    fetchChauffeurs();
  }, []);

  const fetchCharges = async () => {
    const res = await axios.get('/api/charges');
    setCharges(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/api/chauffeurs');
    setChauffeurs(res.data);
    const map: Record<string, string> = {};
    res.data.forEach((c: Chauffeur) => {
      map[c._id] = `${c.nom} ${c.prenom}`;
    });
    setChauffeurMap(map);
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
    const chauffeurObj =
      typeof charge.chauffeur === 'string'
        ? chauffeurs.find(c => c._id === charge.chauffeur)
        : charge.chauffeur || null;
    setChauffeurSelectionne(chauffeurObj || null);
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
    } catch (err) {
      console.error(err);
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

  const filteredCharges = charges.filter((c) => {
    const date = new Date(c.date);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString();
    return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
  });

  const handleExport = () => {
    const data = filteredCharges.map((c) => ({
      Type: c.type,
      Montant: `${c.montant.toFixed(2)} MAD`,
      Date: new Date(c.date).toLocaleDateString(),
      Statut: c.statut,
      Chauffeur:
        typeof c.chauffeur === 'string'
          ? chauffeurMap[c.chauffeur] || '—'
          : c.chauffeur
          ? `${c.chauffeur.nom} ${c.chauffeur.prenom}`
          : '—',
      Notes: c.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, `charges_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Gestion des Charges
          </Typography>
          <Box display="flex" gap={1}>
            <Button startIcon={<Download />} variant="outlined" onClick={handleExport}>
              Exporter
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Ajouter
            </Button>
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Mois</InputLabel>
            <Select
              value={selectedMonth}
              label="Mois"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Année</InputLabel>
            <Select
              value={selectedYear}
              label="Année"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="">Toutes</MenuItem>
              {Array.from(new Set(charges.map((c) => new Date(c.date).getFullYear())))
                .sort()
                .map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                {['Type', 'Montant', 'Date', 'Statut', 'Chauffeur', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCharges.slice((page - 1) * perPage, page * perPage).map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>{c.type}</TableCell>
                  <TableCell>{c.montant.toFixed(2)} MAD</TableCell>
                  <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={c.statut}
                      color={c.statut === 'Payé' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {typeof c.chauffeur === 'string'
                      ? chauffeurMap[c.chauffeur] || '—'
                      : c.chauffeur
                      ? `${c.chauffeur.nom} ${c.chauffeur.prenom}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(c)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" my={2}>
            <Pagination
              count={Math.ceil(filteredCharges.length / perPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Paper>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              {isEditing ? 'Modifier' : 'Ajouter'} une charge
            </Typography>

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
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
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

            <TextField
              label="Notes"
              value={form.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              fullWidth
              margin="normal"
            />

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
