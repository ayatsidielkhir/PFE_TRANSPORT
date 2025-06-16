// ✅ Page Factures - Version stylisée, claire et moderne

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, TextField, Typography, Button, Select, MenuItem, Snackbar, Alert, Slide, SlideProps,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse, Divider, Stack, Badge, Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Layout from '../../components/Layout';


const API = process.env.REACT_APP_API_URL;


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
  
function TransitionUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const [notifOpen, setNotifOpen] = useState(false);
const [notifMessage, setNotifMessage] = useState('');
const [notifSeverity, setNotifSeverity] = useState<'success' | 'error'>('success');
const selectedClient = partenaires.find(p => p._id === client);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    axios.get('${API}/partenaires').then(res => setPartenaires(res.data));
    axios.get('${API}/factures').then(res => setFactures(res.data));
    setDate(today);
  }, []);

  const totalHT = lignes.reduce((sum, l) => sum + (Number(l.totalHT) || 0), 0);
  const totalTVA = totalHT * (isNaN(tva) ? 0 : tva) / 100;
  const totalTTC = totalHT + totalTVA;
  const isFormValid = () => client && date && lignes.length > 0 &&
    lignes.every(l => l.date && l.remorque && l.chargement && l.dechargement && !isNaN(l.totalHT));

  const handleLigneChange = <K extends keyof Ligne>(i: number, field: K, val: string | number) => {
    const updated = [...lignes];
    updated[i] = { ...updated[i], [field]: field === 'totalHT' ? parseFloat(val as string) || 0 : val };
    setLignes(updated);
  };

  const addLigne = () => setLignes([...lignes, { date: '', remorque: '', chargement: '', dechargement: '', totalHT: 0 }]);
  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));
  const resetForm = () => { setDate(today); setClient(''); setTracteur(''); setTva(0); setLignes([]); };

  const handleSubmit = async () => {
    if (!isFormValid()) return alert("Merci de compléter tous les champs.");
    try {
      const res = await axios.post('${API}/factures/manual', {
        date, partenaire: client, ice: selectedClient?.ice || '', tracteur, lignes, tva,
        totalHT: parseFloat(totalHT.toFixed(2)), totalTTC: parseFloat(totalTTC.toFixed(2))
      });
      window.open(`http://localhost:5000${res.data.fileUrl}`, '_blank');
      const updated = await axios.get('${API}/factures');
      setFactures(updated.data); resetForm();
    } catch (err) {
      console.error(err); alert("Erreur lors de la génération de la facture.");
    }
  };

  const handleEdit = async (f: Facture) => {
    try {
      const res = await axios.get(`${API}/factures/${f._id}`);
      const data = res.data;
      setDate(data.date); setClient(data.partenaire._id); setTracteur(data.tracteur); setLignes(data.lignes);
    } catch { console.error("Erreur chargement facture"); }
  };

  const handleDelete = async () => {
    if (!factureToDelete) return;
    try {
      await axios.delete(`${API}/factures/${factureToDelete._id}`);
      setFactures(prev => prev.filter(f => f._id !== factureToDelete._id)); setFactureToDelete(null);
    } catch { alert("Erreur lors de la suppression."); }
  };

  const toggleStatut = async (f: Facture) => {
    try {
      await axios.put(`${API}/factures/${f._id}/statut`);
      const updated = await axios.get('${API}/factures');
      setFactures(updated.data);
    } catch { alert("Erreur statut."); }
  };

  const handleExportExcel = () => {
    const data = factures.map(f => ({
      Numero: f.numero, Date: f.date, Client: f.client?.nom || '',
      Tracteur: f.tracteur, TotalTTC: f.totalTTC, Statut: f.statut,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Factures');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'factures.xlsx');
  };

  const facturesFiltrees = factures.filter(f => {
    const [y, m] = f.date.split('-');
    return (!anneeFiltre || y === anneeFiltre) && (!moisFiltre || m === moisFiltre);
  });
  const facturesJour = facturesFiltrees.filter(f => f.date === today);
  const archives = facturesFiltrees.filter(f => f.date !== today);
  const annees = Array.from(new Set(factures.map(f => f.date.split('-')[0])));
  const impayeesCount = useMemo(() => factures.filter(f => f.statut === 'impayée').length, [factures]);

  return (
    <Layout>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">Gestion des Factures</Typography>
          <Badge badgeContent={impayeesCount} color="error"><Typography>Impayées</Typography></Badge>
        </Stack>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Nouvelle Facture</Typography>
          <Stack direction="row" flexWrap="wrap" spacing={2} mb={2}>
            <TextField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Select value={client} onChange={e => setClient(e.target.value)} displayEmpty>
              <MenuItem value="">Client</MenuItem>
              {partenaires.map(p => <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>)}
            </Select>
            <TextField label="ICE" value={selectedClient?.ice || ''} disabled />
            <TextField label="Tracteur" value={tracteur} onChange={e => setTracteur(e.target.value)} />
            <TextField label="TVA (%)" type="number" value={isNaN(tva) ? '' : tva} onChange={e => setTva(parseFloat(e.target.value))} />
          </Stack>

          <Table size="small">
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
              <TableRow>
                <TableCell colSpan={6}><Button onClick={addLigne} startIcon={<Add />}>Ajouter ligne</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Stack direction="row" spacing={2} mt={2}>
            <TextField label="Total HT" value={totalHT.toFixed(2)} disabled />
            <TextField label="TVA" value={totalTVA.toFixed(2)} disabled />
            <TextField label="Total TTC" value={totalTTC.toFixed(2)} disabled />
          </Stack>

          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid()}>Générer et enregistrer</Button>
            <Button variant="outlined" color="secondary" onClick={resetForm}>Réinitialiser</Button>
          </Stack>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600}>Historique des factures</Typography>
          <Stack direction="row" spacing={2} my={2}>
            <Select value={moisFiltre} onChange={e => setMoisFiltre(e.target.value)} displayEmpty>
              <MenuItem value="">Tous les mois</MenuItem>
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
            <Select value={anneeFiltre} onChange={e => setAnneeFiltre(e.target.value)} displayEmpty>
              <MenuItem value="">Toutes les années</MenuItem>
              {annees.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
            <Button variant="outlined" onClick={handleExportExcel}>Exporter Excel</Button>
          </Stack>

          {[{ title: 'Factures du jour', data: facturesJour }, { title: 'Archives', data: archives }].map(section => (
            <Box key={section.title} mt={3}>
              <Typography variant="subtitle1" fontWeight={600}>{section.title}</Typography>
              <Collapse in={section.title === 'Archives' ? archiveOpen : true}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>N°</TableCell><TableCell>Date</TableCell><TableCell>Client</TableCell>
                      <TableCell>Tracteur</TableCell><TableCell>Total TTC</TableCell>
                      <TableCell>Statut</TableCell><TableCell>PDF</TableCell><TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.data.map(f => (
                      <TableRow key={f._id}>
                        <TableCell>{f.numero}</TableCell>
                        <TableCell>{f.date}</TableCell>
                        <TableCell>{f.client?.nom || '—'}</TableCell>
                        <TableCell>{f.tracteur}</TableCell>
                        <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                        <TableCell>
                          <Button size="small" variant="contained" color={f.statut === 'payée' ? 'success' : 'error'} onClick={() => toggleStatut(f)}>
                            {f.statut}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => window.open(`http://localhost:5000${f.fileUrl}`, '_blank')}>Voir PDF</Button>
                        </TableCell>
                        <TableCell>
                          <Button size="small" color="warning" onClick={() => handleEdit(f)}>Modifier</Button>
                          <Button size="small" color="error" onClick={() => setFactureToDelete(f)}>Supprimer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Collapse>
              {section.title === 'Archives' && (
                <Button onClick={() => setArchiveOpen(!archiveOpen)} sx={{ mt: 1 }}>
                  {archiveOpen ? 'Masquer les archives' : 'Afficher les archives'}
                </Button>
              )}
            </Box>
          ))}
        </Paper>

        <Dialog open={!!factureToDelete} onClose={() => setFactureToDelete(null)}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>Supprimer la facture n° {factureToDelete?.numero} ?</DialogContent>
          <DialogActions>
            <Button onClick={() => setFactureToDelete(null)}>Annuler</Button>
            <Button color="error" onClick={handleDelete}>Supprimer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    
      <Snackbar
        open={notifOpen}
        autoHideDuration={4000}
        onClose={() => setNotifOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={TransitionUp}
      >
        <Alert
          onClose={() => setNotifOpen(false)}
          severity={notifSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notifMessage}
        </Alert>
      </Snackbar>
</Layout>
  );
};

export default FacturesPage;