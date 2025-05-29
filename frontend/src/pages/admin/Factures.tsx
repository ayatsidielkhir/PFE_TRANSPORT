import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Typography, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper, Stack,
  Collapse, Divider, Badge
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Layout from '../../components/Layout';

interface Partenaire {
  _id: string;
  nom: string;
  ice?: string;
}
interface Ligne {
  date: string;
  remorque: string;
  chargement: string;
  dechargement: string;
  totalHT: number;
}
interface Facture {
  _id: string;
  numero: string;
  date: string;
  client: { nom: string; _id?: string };
  ice: string;
  tracteur: string;
  totalTTC: number;
  fileUrl: string;
  statut: 'payée' | 'impayée';
}

const FacturesPage: React.FC = () => {
  const [date, setDate] = useState('');
  const [tracteur, setTracteur] = useState('');
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [client, setClient] = useState('');
  const [tva, setTva] = useState(0);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [factureToDelete, setFactureToDelete] = useState<Facture | null>(null);
  const [moisFiltre, setMoisFiltre] = useState('');
  const [anneeFiltre, setAnneeFiltre] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const selectedClient = partenaires.find(p => p._id === client);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get('https://mme-backend.onrender.com/api/partenaires').then(res => setPartenaires(res.data));
    axios.get('https://mme-backend.onrender.com/api/factures').then(res => setFactures(res.data));
    setDate(today);
  }, []);

  const totalHT = lignes.reduce((sum, l) => sum + (Number(l.totalHT) || 0), 0);
  const totalTVA = totalHT * (isNaN(tva) ? 0 : tva) / 100;
  const totalTTC = totalHT + totalTVA;

  const isFormValid = () => client && date && lignes.length > 0 && lignes.every(l => l.date && l.remorque && l.chargement && l.dechargement && !isNaN(l.totalHT));

  const handleLigneChange = <K extends keyof Ligne>(index: number, field: K, value: string | number) => {
    const updated = [...lignes];
    updated[index] = { ...updated[index], [field]: field === 'totalHT' ? parseFloat(value as string) || 0 : value };
    setLignes(updated);
  };

  const addLigne = () => setLignes([...lignes, { date: '', remorque: '', chargement: '', dechargement: '', totalHT: 0 }]);
  const removeLigne = (index: number) => setLignes(lignes.filter((_, i) => i !== index));
  const resetForm = () => { setDate(today); setClient(''); setTracteur(''); setTva(0); setLignes([]); };

  const handleSubmit = async () => {
    if (!isFormValid()) return alert("Merci de compléter tous les champs de la facture.");
    try {
      const res = await axios.post('https://mme-backend.onrender.com/api/factures/manual', {
        date, partenaire: client, ice: selectedClient?.ice || '', tracteur, lignes,
        tva: isNaN(tva) ? 0 : tva, totalHT: parseFloat(totalHT.toFixed(2)), totalTTC: parseFloat(totalTTC.toFixed(2))
      });
      window.open(`https://mme-backend.onrender.com${res.data.fileUrl}`, '_blank');
      const updated = await axios.get('https://mme-backend.onrender.com/api/factures');
      setFactures(updated.data);
      resetForm();
    } catch (err) {
      alert("Erreur lors de la génération de la facture.");
    }
  };

  const handleEdit = async (facture: Facture) => {
    try {
      const res = await axios.get(`https://mme-backend.onrender.com/api/factures/${facture._id}`);
      const data = res.data;
      setDate(data.date);
      setClient(data.partenaire._id);
      setTracteur(data.tracteur);
      setLignes(data.lignes);
    } catch {
      alert("Erreur lors du chargement de la facture.");
    }
  };

  const handleDelete = async () => {
    if (!factureToDelete) return;
    try {
      await axios.delete(`https://mme-backend.onrender.com/api/factures/${factureToDelete._id}`);
      setFactures(prev => prev.filter(f => f._id !== factureToDelete._id));
      setFactureToDelete(null);
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const toggleStatut = async (facture: Facture) => {
    try {
      await axios.put(`https://mme-backend.onrender.com/api/factures/${facture._id}/statut`);
      const updated = await axios.get('https://mme-backend.onrender.com/api/factures');
      setFactures(updated.data);
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  };

  const handleExportExcel = () => {
    const data = factures.map(f => ({
      Numero: f.numero, Date: f.date, Client: f.client?.nom || '',
      Tracteur: f.tracteur, TotalTTC: f.totalTTC, Statut: f.statut
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Factures');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'factures.xlsx');
  };

  const facturesFiltrees = factures.filter(f => {
    const [fAnnee, fMois] = f.date.split('-');
    return (!anneeFiltre || fAnnee === anneeFiltre) && (!moisFiltre || fMois === moisFiltre);
  });

  const facturesJour = facturesFiltrees.filter(f => f.date === today);
  const facturesArchivees = facturesFiltrees.filter(f => f.date !== today);
  const annees = Array.from(new Set(factures.map(f => f.date.split('-')[0])));
  const impayeesCount = useMemo(() => factures.filter(f => f.statut === 'impayée').length, [factures]);

  return (
    <Layout>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight={600} color="#001e61">Gestion des Factures</Typography>
          <Badge badgeContent={impayeesCount} color="error">Factures impayées</Badge>
        </Stack>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Nouvelle Facture</Typography>
          <Stack spacing={2}>
            <TextField label="Date" type="date" fullWidth value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Select fullWidth displayEmpty value={client} onChange={e => setClient(e.target.value)}>
              <MenuItem value="">Sélectionner client</MenuItem>
              {partenaires.map(p => <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>)}
            </Select>
            <TextField label="ICE" fullWidth value={selectedClient?.ice || ''} disabled />
            <TextField label="Tracteur" fullWidth value={tracteur} onChange={e => setTracteur(e.target.value)} />
            <TextField label="TVA (%)" fullWidth type="number" value={tva} onChange={e => setTva(Number(e.target.value))} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell><TableCell>Remorque</TableCell><TableCell>Chargement</TableCell>
                  <TableCell>Déchargement</TableCell><TableCell>Total HT</TableCell><TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lignes.map((ligne, i) => (
                  <TableRow key={i}>
                    <TableCell><TextField type="date" value={ligne.date} onChange={e => handleLigneChange(i, 'date', e.target.value)} /></TableCell>
                    <TableCell><TextField value={ligne.remorque} onChange={e => handleLigneChange(i, 'remorque', e.target.value)} /></TableCell>
                    <TableCell><TextField value={ligne.chargement} onChange={e => handleLigneChange(i, 'chargement', e.target.value)} /></TableCell>
                    <TableCell><TextField value={ligne.dechargement} onChange={e => handleLigneChange(i, 'dechargement', e.target.value)} /></TableCell>
                    <TableCell><TextField type="number" value={ligne.totalHT} onChange={e => handleLigneChange(i, 'totalHT', e.target.value)} /></TableCell>
                    <TableCell><IconButton onClick={() => removeLigne(i)}><Delete /></IconButton></TableCell>
                  </TableRow>
                ))}
                <TableRow><TableCell colSpan={6}><Button onClick={addLigne} startIcon={<Add />}>Ajouter ligne</Button></TableCell></TableRow>
              </TableBody>
            </Table>

            <Stack direction="row" spacing={2}>
              <TextField label="Total HT" value={totalHT.toFixed(2)} disabled />
              <TextField label="TVA" value={totalTVA.toFixed(2)} disabled />
              <TextField label="Total TTC" value={totalTTC.toFixed(2)} disabled />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid()}>Générer</Button>
              <Button variant="outlined" color="secondary" onClick={resetForm}>Réinitialiser</Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Historique, filtres, suppression... */}
        {/* (Gardé comme précédemment) */}
      </Box>
    </Layout>
  );
};

export default FacturesPage;
