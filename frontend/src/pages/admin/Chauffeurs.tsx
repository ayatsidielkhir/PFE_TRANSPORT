import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, InputAdornment, Drawer,
  IconButton, Tooltip
} from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Chauffeur {
  _id?: string;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  adresse?: string;
  observations?: string;
  permis: { type: string; date_expiration: string };
  contrat: { type: string; date_expiration: string };
  visa: { actif: boolean; date_expiration?: string };
  scanPermis?: string;
  scanVisa?: string;
  scanCIN?: string;
}

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [form, setForm] = useState<Chauffeur>({
    _id: '',
    nom: '', prenom: '', telephone: '', cin: '', adresse: '', observations: '',
    permis: { type: '', date_expiration: '' },
    contrat: { type: '', date_expiration: '' },
    visa: { actif: false, date_expiration: '' }
  });
  const [scanPermis, setScanPermis] = useState<File | null>(null);
  const [scanVisa, setScanVisa] = useState<File | null>(null);
  const [scanCIN, setScanCIN] = useState<File | null>(null);

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const fetchChauffeurs = async () => {
    const res = await axios.get('/chauffeur');
    setChauffeurs(res.data);
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      await axios.delete(`/chauffeur/${id}`);
      fetchChauffeurs();
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('nom', form.nom);
    data.append('prenom', form.prenom);
    data.append('telephone', form.telephone);
    data.append('cin', form.cin);
    data.append('adresse', form.adresse || '');
    data.append('observations', form.observations || '');
    data.append('permis_type', form.permis.type);
    data.append('permis_date_expiration', formatDate(form.permis.date_expiration));
    data.append('contrat_type', form.contrat.type);
    data.append('contrat_date_expiration', formatDate(form.contrat.date_expiration));
    data.append('visa_actif', String(form.visa.actif));
    data.append('visa_date_expiration', formatDate(form.visa.date_expiration || ''));

    if (scanPermis) data.append('scanPermis', scanPermis);
    if (scanVisa) data.append('scanVisa', scanVisa);
    if (scanCIN) data.append('scanCIN', scanCIN);

    const res = selectedChauffeur && selectedChauffeur._id
      ? await axios.put(`/chauffeur/${selectedChauffeur._id}`, data)
      : await axios.post('/chauffeur', data);

    if (res.status === 200 || res.status === 201) {
      fetchChauffeurs();
      setDrawerOpen(false);
    }
  };

  const generatePdf = (c: Chauffeur) => {
    const doc = new jsPDF();
    doc.text(`Fiche du chauffeur ${c.nom} ${c.prenom}`, 14, 16);
    autoTable(doc, {
      head: [['Champ', 'Valeur']],
      body: [
        ['Nom', c.nom],
        ['Prénom', c.prenom],
        ['Téléphone', c.telephone],
        ['CIN', c.cin],
        ['Adresse', c.adresse || '-'],
        ['Permis', `${c.permis.type} - ${formatDate(c.permis.date_expiration)}`],
        ['Contrat', `${c.contrat.type} - ${formatDate(c.contrat.date_expiration)}`],
        ['Visa Actif', c.visa.actif ? 'Oui' : 'Non'],
        ['Visa Exp.', formatDate(c.visa.date_expiration || '')],
        ['Observations', c.observations || '-']
      ]
    });
    doc.save(`chauffeur_${c.nom}_${c.prenom}.pdf`);
  };

  const getExpirationColor = (dateStr?: string): React.CSSProperties => {
    if (!dateStr) return {};
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (diff < 0) return { color: 'red', fontWeight: 'bold' };
    if (diff < 30) return { color: 'orange', fontWeight: 'bold' };
    return {};
  };

  const filtered = chauffeurs.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={600}>Chauffeurs</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)}>Ajouter</Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Prénom</strong></TableCell>
                <TableCell><strong>Téléphone</strong></TableCell>
                <TableCell><strong>Permis</strong></TableCell>
                <TableCell><strong>Contrat</strong></TableCell>
                <TableCell><strong>Visa Exp.</strong></TableCell>
                <TableCell><strong>Docs</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c._id}>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell style={getExpirationColor(c.permis.date_expiration)}>
                    {c.permis.type} - {formatDate(c.permis.date_expiration)}
                  </TableCell>
                  <TableCell style={getExpirationColor(c.contrat.date_expiration)}>
                    {c.contrat.type} - {formatDate(c.contrat.date_expiration)}
                  </TableCell>
                  <TableCell style={getExpirationColor(c.visa.date_expiration)}>
                    {formatDate(c.visa.date_expiration || '')}
                  </TableCell>
                  <TableCell>
                    {c.scanPermis && <a href={`http://localhost:5000/uploads/${c.scanPermis}`} target="_blank">Permis</a>}<br />
                    {c.scanVisa && <a href={`http://localhost:5000/uploads/${c.scanVisa}`} target="_blank">Visa</a>}<br />
                    {c.scanCIN && <a href={`http://localhost:5000/uploads/${c.scanCIN}`} target="_blank">CIN</a>}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>{selectedChauffeur ? 'Modifier Chauffeur' : 'Ajouter Chauffeur'}</Typography>
            <TextField label="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="CIN" value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField type="text" label="Type Permis" value={form.permis.type} onChange={e => setForm({ ...form, permis: { ...form.permis, type: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Permis" value={form.permis.date_expiration} onChange={e => setForm({ ...form, permis: { ...form.permis, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="text" label="Type Contrat" value={form.contrat.type} onChange={e => setForm({ ...form, contrat: { ...form.contrat, type: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Contrat" value={form.contrat.date_expiration} onChange={e => setForm({ ...form, contrat: { ...form.contrat, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Visa" value={form.visa.date_expiration} onChange={e => setForm({ ...form, visa: { ...form.visa, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <Button variant="contained" fullWidth onClick={handleSubmit}>{selectedChauffeur ? 'Modifier' : 'Ajouter'} Chauffeur</Button>
          </Box>
        </Drawer>
      </Box>
    </Layout>
  );
};

export default ChauffeursPage;
