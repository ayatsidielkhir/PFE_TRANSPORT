import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Typography, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  useMediaQuery, InputLabel, FormControl, Badge, Pagination, Paper, Dialog, DialogTitle, DialogContent, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Visibility, PictureAsPdf, GridOn } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = process.env.REACT_APP_API_URL;

interface Operation {
  _id?: string;
  type: 'Entrée' | 'Sortie';
  montant: number;
  date: string;
  nom: string;
  sujet: string;
  modePaiement: string;
  statut: 'Payé' | 'Non payé';
  justificatif?: string;
}

const CaissePage: React.FC = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [form, setForm] = useState<Partial<Operation>>({ type: 'Sortie', statut: 'Non payé' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterNom, setFilterNom] = useState('');
  const [selected, setSelected] = useState<Operation | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');

  const fetchData = async () => {
    const res = await axios.get(`${API}/caisse`);
    setOperations(res.data);
  };

  const handleExportExcel = () => {
    const exportData = filtered.map(op => ({
      Type: op.type,
      Montant: `${op.montant} MAD`,
      Date: new Date(op.date).toLocaleDateString(),
      Nom: op.nom,
      Sujet: op.sujet,
      Paiement: op.modePaiement,
      Statut: op.statut
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Caisse');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'operations_caisse.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des opérations de caisse', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [['Type', 'Montant', 'Date', 'Nom', 'Sujet', 'Paiement', 'Statut']],
      body: filtered.map(op => [
        op.type,
        `${op.montant} MAD`,
        new Date(op.date).toLocaleDateString(),
        op.nom,
        op.sujet,
        op.modePaiement,
        op.statut
      ])
    });
    doc.save('operations_caisse.pdf');
  };

  const resetFilters = () => {
    setSearch('');
    setFilterNom('');
    setFilterType('');
    setFilterStatut('');
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name!]: value }));
  };

  const handleSubmit = async () => {
    if (!form.date) return alert("Veuillez renseigner la date");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, key === 'date' ? new Date(value).toISOString() : value.toString());
      }
    });
    if (file) formData.append('justificatif', file);

    const method = selected ? axios.put : axios.post;
    const url = selected ? `${API}/caisse/${selected._id}` : `${API}/caisse`;

    await method(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    fetchData();
    setDrawerOpen(false);
    setForm({ type: 'Sortie', statut: 'Non payé' });
    setFile(null);
    setSelected(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette opération ?')) {
      await axios.delete(`${API}/caisse/${id}`);
      fetchData();
    }
  };

  const filtered = operations.filter(op =>
    (!filterType || op.type === filterType) &&
    (!filterStatut || op.statut === filterStatut) &&
    (!filterNom || op.nom.toLowerCase().includes(filterNom.toLowerCase())) &&
    (!search || op.sujet.toLowerCase().includes(search.toLowerCase()))
  );

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const currentMonth = new Date().getMonth();
  const totalEntrees = operations.filter(op => op.type === 'Entrée' && new Date(op.date).getMonth() === currentMonth).reduce((sum, op) => sum + op.montant, 0);
  const totalSorties = operations.filter(op => op.type === 'Sortie' && new Date(op.date).getMonth() === currentMonth).reduce((sum, op) => sum + op.montant, 0);
  const soldeGlobal = operations.reduce((acc, op) => acc + (op.type === 'Entrée' ? op.montant : -op.montant), 0);

  let solde = 0;

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1300px" mx="auto">
        {/* Statistiques stylisées */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[{
            label: 'Solde actuel',
            value: soldeGlobal.toFixed(2) + ' MAD',
            color: '#001e61'
          }, {
            label: 'Entrées ce mois',
            value: totalEntrees.toFixed(2) + ' MAD',
            color: '#388e3c'
          }, {
            label: 'Sorties ce mois',
            value: totalSorties.toFixed(2) + ' MAD',
            color: '#d32f2f'
          }].map((stat, idx) => (
            <Paper key={idx} elevation={3} sx={{
              flex: '1 1 200px', p: 2, borderLeft: `6px solid ${stat.color}`,
              borderRadius: 2, backgroundColor: '#fefefe', textAlign: 'center'
            }}>
              <Typography variant="subtitle2" color="textSecondary">{stat.label}</Typography>
              <Typography variant="h6" fontWeight="bold">{stat.value}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Filtres */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} gap={2}>
            <Box display="flex" flexWrap="wrap" gap={2} width={isMobile ? '100%' : '75%'}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Type</InputLabel>
                <Select value={filterType} onChange={e => setFilterType(e.target.value)} sx={{ borderRadius: 2, backgroundColor: 'white' }}>
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Entrée">Entrée</MenuItem>
                  <MenuItem value="Sortie">Sortie</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Statut</InputLabel>
                <Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} sx={{ borderRadius: 2, backgroundColor: 'white' }}>
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Payé">Payé</MenuItem>
                  <MenuItem value="Non payé">Non payé</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Nom" value={filterNom} onChange={e => setFilterNom(e.target.value)} size="small" />
              <Button onClick={resetFilters} size="small" color="inherit" sx={{ height: 40, fontWeight: 'bold' }}>Réinitialiser</Button>
            </Box>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)} sx={{
              backgroundColor: '#001e61', borderRadius: 3, textTransform: 'none',
              fontWeight: 'bold', px: 3, boxShadow: 2, '&:hover': { backgroundColor: '#001447' }
            }}>
              Ajouter Opération
            </Button>
          </Box>
        </Paper>

        {/* Tableau */}
        <Table>
          <TableHead sx={{ backgroundColor: '#e3f2fd' }}>
            <TableRow>
              {['Type', 'Montant', 'Date', 'Nom', 'Sujet', 'Paiement', 'Statut', 'Solde', 'Justificatif', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 'bold' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((op, i) => {
              solde += op.type === 'Entrée' ? op.montant : -op.montant;
              return (
                <TableRow key={op._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{op.type}</TableCell>
                  <TableCell>{op.montant.toFixed(2)} MAD</TableCell>
                  <TableCell>{new Date(op.date).toLocaleDateString()}</TableCell>
                  <TableCell>{op.nom}</TableCell>
                  <TableCell>{op.sujet}</TableCell>
                  <TableCell>{op.modePaiement}</TableCell>
                  <TableCell><Badge color={op.statut === 'Payé' ? 'success' : 'error'} badgeContent={op.statut} /></TableCell>
                  <TableCell>{solde.toFixed(2)} MAD</TableCell>
                  <TableCell>
                    {op.justificatif && (
                      <Tooltip title="Voir justificatif">
                        <IconButton onClick={() => {
                          setDialogImageSrc(`${API?.replace('/api', '')}/uploads/caisse/${op.justificatif}`);
                          setDialogTitle(op.justificatif || '');
                          setOpenDialog(true);
                        }}>
                          <PictureAsPdf sx={{ color: 'red' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setForm(op); setSelected(op); setDrawerOpen(true); }} sx={{ color: '#001e61' }}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(op._id!)} sx={{ color: '#d32f2f' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Pagination + export */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
          <Box flex={1} display="flex" justifyContent="center">
            <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, value) => setPage(value)} color="primary" />
          </Box>
          <Box display="flex" gap={1}>
            <Button variant="contained" startIcon={<PictureAsPdf />} onClick={handleExportPDF} sx={{ backgroundColor: '#d32f2f', borderRadius: 3 }}>PDF</Button>
            <Button variant="contained" startIcon={<GridOn />} onClick={handleExportExcel} sx={{ backgroundColor: '#388e3c', borderRadius: 3 }}>Excel</Button>
          </Box>
        </Box>

        {/* Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={isMobile ? '100vw' : 400} sx={{ bgcolor: 'white' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Ajouter / Modifier Opération</Typography>

            <TextField fullWidth label="Nom" name="nom" value={form.nom || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Sujet" name="sujet" value={form.sujet || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select name="type" value={form.type || ''} label="Type" onChange={handleChange}>
                <MenuItem value="Entrée">Entrée</MenuItem>
                <MenuItem value="Sortie">Sortie</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Mode Paiement</InputLabel>
              <Select name="modePaiement" value={form.modePaiement || ''} label="Mode Paiement" onChange={handleChange}>
                <MenuItem value="Espèces">Espèces</MenuItem>
                <MenuItem value="Virement">Virement</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Statut</InputLabel>
              <Select name="statut" value={form.statut || ''} label="Statut" onChange={handleChange}>
                <MenuItem value="Payé">Payé</MenuItem>
                <MenuItem value="Non payé">Non payé</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Montant" name="montant" type="number" fullWidth value={form.montant || ''} onChange={handleChange} sx={{ mb: 2 }} />
            <TextField label="Date" name="date" type="date" fullWidth value={form.date ? new Date(form.date).toISOString().split('T')[0] : ''} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <Button component="label" variant="outlined" fullWidth sx={{ mb: 2 }}>
              Justificatif (PDF/Image)
              <input hidden type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </Button>
            <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2, borderRadius: 3 }}>Enregistrer</Button>
          </Box>
        </Drawer>

        {/* Dialog justificatif */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
          <DialogTitle>Visualisation PDF</DialogTitle>
          <DialogContent>
            <iframe src={dialogImageSrc} width="100%" height="600px" title="Justificatif PDF" style={{ border: 'none' }} />
            <Button onClick={() => window.open(dialogImageSrc, '_blank')} variant="outlined" sx={{ mt: 2 }}>
              Télécharger
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default CaissePage;
