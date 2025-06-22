// ✅ FacturesPage.tsx complet avec sélection de trajets, génération auto, tableau des factures, filtres, Excel, pagination

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Typography, Button, Select, MenuItem, Snackbar, Alert, Slide, SlideProps,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Paper, Pagination
} from '@mui/material';
import { Add, Delete, Visibility, Paid } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Layout from '../../components/Layout';

const API = process.env.REACT_APP_API_URL;

const FacturesPage: React.FC = () => {
  const [date, setDate] = useState('');
  const [tracteur, setTracteur] = useState('');
  const [partenaires, setPartenaires] = useState<any[]>([]);
  const [client, setClient] = useState('');
  const [tva, setTva] = useState(0);
  const [lignes, setLignes] = useState<any[]>([]);
  const [factures, setFactures] = useState<any[]>([]);
  const [factureToDelete, setFactureToDelete] = useState<any | null>(null);
  const [trajetsClient, setTrajetsClient] = useState<any[]>([]);
  const [selectedTrajetId, setSelectedTrajetId] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState<'success' | 'error'>('success');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const selectedClient = partenaires.find(p => p._id === client);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get(`${API}/partenaires`).then(res => setPartenaires(res.data));
    axios.get(`${API}/factures`).then(res => setFactures(res.data));
    setDate(today);
  }, []);

  useEffect(() => {
    if (!client) return setTrajetsClient([]);
    axios.get(`${API}/trajets/non-factures/${client}`)
      .then(res => setTrajetsClient(res.data))
      .catch(() => setTrajetsClient([]));
  }, [client]);

  useEffect(() => {
    if (!selectedTrajetId) return;
    const trajet = trajetsClient.find(t => t._id === selectedTrajetId);
    if (trajet) {
      setLignes([{ date: trajet.date?.split('T')[0], remorque: trajet.vehicule, chargement: trajet.depart, dechargement: trajet.arrivee, totalHT: trajet.totalHT }]);
    }
  }, [selectedTrajetId]);

  const totalHT = lignes.reduce((sum, l) => sum + (Number(l.totalHT) || 0), 0);
  const totalTVA = totalHT * (isNaN(tva) ? 0 : tva) / 100;
  const totalTTC = totalHT + totalTVA;

  const isFormValid = () => client && date && lignes.length > 0 &&
    lignes.every(l => l.date && l.remorque && l.chargement && l.dechargement && !isNaN(l.totalHT));

  const handleLigneChange = (i: number, field: string, val: string | number) => {
    const updated = [...lignes];
    updated[i] = { ...updated[i], [field]: field === 'totalHT' ? parseFloat(val as string) || 0 : val };
    setLignes(updated);
  };

  const addLigne = () => setLignes([...lignes, { date: '', remorque: '', chargement: '', dechargement: '', totalHT: 0 }]);
  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));
  const resetForm = () => { setDate(today); setClient(''); setTracteur(''); setTva(0); setLignes([]); setSelectedTrajetId(''); };

  const handleSubmit = async () => {
    if (!isFormValid()) return alert("Merci de compléter tous les champs.");
    try {
      const res = await axios.post(`${API}/factures/manual`, {
        date, partenaire: client, ice: selectedClient?.ice || '', tracteur, lignes, tva,
        totalHT: parseFloat(totalHT.toFixed(2)), totalTTC: parseFloat(totalTTC.toFixed(2))
      });
      window.open(`${API}${res.data.fileUrl}`, '_blank');
      const updated = await axios.get(`${API}/factures`);
      setFactures(updated.data); resetForm();
    } catch (err) {
      console.error(err); alert("Erreur lors de la génération de la facture.");
    }
  };

  const handleDelete = async () => {
    if (!factureToDelete) return;
    try {
      await axios.delete(`${API}/factures/${factureToDelete._id}`);
      const updated = await axios.get(`${API}/factures`);
      setFactures(updated.data);
      setFactureToDelete(null);
    } catch (err) {
      alert("Erreur suppression.");
    }
  };

  const handleToggleStatut = async (id: string) => {
    try {
      await axios.put(`${API}/factures/${id}/statut`);
      const updated = await axios.get(`${API}/factures`);
      setFactures(updated.data);
    } catch (err) {
      alert("Erreur mise à jour du statut");
    }
  };

  const filteredFactures = useMemo(() => {
    return factures.filter(f =>
      (!filterClient || f.client.nom === filterClient) &&
      (!filterStatut || f.statut === filterStatut)
    );
  }, [factures, filterClient, filterStatut]);

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredFactures.map(f => ({
      Numéro: f.numero,
      Client: f.client.nom,
      Date: f.date,
      Total_TTC: f.totalTTC,
      Statut: f.statut
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'factures.xlsx');
  };

  function TransitionUp(props: SlideProps) {
    return <Slide {...props} direction="up" />;
  }

  const paginatedFactures = filteredFactures.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>Gestion des Factures</Typography>

        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 5 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Créer une facture</Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <TextField type="date" label="Date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Select value={client} onChange={e => setClient(e.target.value)} displayEmpty>
              <MenuItem value="">Choisir un client</MenuItem>
              {partenaires.map(p => <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>)}
            </Select>
            <TextField label="ICE" value={selectedClient?.ice || ''} disabled />
            <TextField label="Tracteur" value={tracteur} onChange={e => setTracteur(e.target.value)} />
            <TextField label="TVA (%)" type="number" value={isNaN(tva) ? '' : tva} onChange={e => setTva(parseFloat(e.target.value))} />
            {trajetsClient.length > 0 && (
              <Select value={selectedTrajetId} onChange={e => setSelectedTrajetId(e.target.value)} displayEmpty>
                <MenuItem value="">Sélectionner un trajet</MenuItem>
                {trajetsClient.map(t => (
                  <MenuItem key={t._id} value={t._id}>{`${t.date.split('T')[0]} | ${t.depart} → ${t.arrivee}`}</MenuItem>
                ))}
              </Select>
            )}
          </Box>

          <Table size="small" sx={{ mb: 2 }}>
            <TableHead><TableRow>
              <TableCell>Date</TableCell><TableCell>Remorque</TableCell><TableCell>Chargement</TableCell>
              <TableCell>Déchargement</TableCell><TableCell>Total HT</TableCell><TableCell>Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {lignes.map((l, i) => (
                <TableRow key={i}>
                  <TableCell><TextField type="date" value={l.date} onChange={e => handleLigneChange(i, 'date', e.target.value)} /></TableCell>
                  <TableCell><TextField value={l.remorque} onChange={e => handleLigneChange(i, 'remorque', e.target.value)} /></TableCell>
                  <TableCell><TextField value={l.chargement} onChange={e => handleLigneChange(i, 'chargement', e.target.value)} /></TableCell>
                  <TableCell><TextField value={l.dechargement} onChange={e => handleLigneChange(i, 'dechargement', e.target.value)} /></TableCell>
                  <TableCell><TextField type="number" value={l.totalHT} onChange={e => handleLigneChange(i, 'totalHT', e.target.value)} /></TableCell>
                  <TableCell><IconButton onClick={() => removeLigne(i)}><Delete /></IconButton></TableCell>
                </TableRow>
              ))}
              <TableRow><TableCell colSpan={6}><Button onClick={addLigne} startIcon={<Add />}>Ajouter ligne</Button></TableCell></TableRow>
            </TableBody>
          </Table>

          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField label="Total HT" value={totalHT.toFixed(2)} disabled />
            <TextField label="TVA" value={totalTVA.toFixed(2)} disabled />
            <TextField label="Total TTC" value={totalTTC.toFixed(2)} disabled />
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid()}>Générer manuellement</Button>
            <Button variant="outlined" onClick={resetForm}>Réinitialiser</Button>
          </Stack>
        </Paper>

        {/* Tableau des factures avec actions, filtres, Excel, pagination */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Select value={filterClient} onChange={e => setFilterClient(e.target.value)} displayEmpty>
            <MenuItem value="">Tous les clients</MenuItem>
            {partenaires.map(p => <MenuItem key={p._id} value={p.nom}>{p.nom}</MenuItem>)}
          </Select>
          <Select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} displayEmpty>
            <MenuItem value="">Tous les statuts</MenuItem>
            <MenuItem value="payée">Payée</MenuItem>
            <MenuItem value="impayée">Impayée</MenuItem>
          </Select>
          <Button onClick={handleExportExcel}>Exporter Excel</Button>
        </Box>

        <Paper>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>Numéro</TableCell><TableCell>Date</TableCell><TableCell>Client</TableCell>
              <TableCell>Total TTC</TableCell><TableCell>Statut</TableCell><TableCell>Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {paginatedFactures.map(f => (
                <TableRow key={f._id}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.client.nom}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)}</TableCell>
                  <TableCell>{f.statut}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => window.open(`${API}${f.fileUrl}`, '_blank')}><Visibility /></IconButton>
                    <IconButton onClick={() => setFactureToDelete(f)}><Delete /></IconButton>
                    <IconButton onClick={() => handleToggleStatut(f._id)}><Paid /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" my={2}>
            <Pagination
              count={Math.ceil(filteredFactures.length / rowsPerPage)}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </Paper>

        <Dialog open={!!factureToDelete} onClose={() => setFactureToDelete(null)}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>Supprimer la facture n° {factureToDelete?.numero} ?</DialogContent>
          <DialogActions>
            <Button onClick={() => setFactureToDelete(null)}>Annuler</Button>
            <Button color="error" onClick={handleDelete}>Supprimer</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notifOpen}
          autoHideDuration={4000}
          onClose={() => setNotifOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={TransitionUp}
        >
          <Alert onClose={() => setNotifOpen(false)} severity={notifSeverity} sx={{ width: '100%' }} variant="filled">
            {notifMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default FacturesPage;