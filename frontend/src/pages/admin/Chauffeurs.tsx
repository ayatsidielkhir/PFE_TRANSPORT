import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Drawer, TextField, Tooltip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';

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
}

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [scanPermis, setScanPermis] = useState<File | null>(null);
  const [scanVisa, setScanVisa] = useState<File | null>(null);
  const [scanCIN, setScanCIN] = useState<File | null>(null);
  const [form, setForm] = useState<Chauffeur>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '', observations: '',
    permis: { type: '', date_expiration: '' },
    contrat: { type: '', date_expiration: '' },
    visa: { actif: false, date_expiration: '' }
  });

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const fetchChauffeurs = async () => {
    const res = await axios.get('http://localhost:5000/api/chauffeurs');
    setChauffeurs(res.data);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      await axios.delete(`http://localhost:5000/api/chauffeurs/${id}`);
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
    data.append('permis_date_expiration', form.permis.date_expiration);
    data.append('contrat_type', form.contrat.type);
    data.append('contrat_date_expiration', form.contrat.date_expiration);
    data.append('visa_actif', String(form.visa.actif));
    data.append('visa_date_expiration', form.visa.date_expiration || '');

    if (scanPermis) data.append('scanPermis', scanPermis);
    if (scanVisa) data.append('scanVisa', scanVisa);
    if (scanCIN) data.append('scanCIN', scanCIN);

    const res = selectedChauffeur && selectedChauffeur._id
      ? await axios.put(`http://localhost:5000/api/chauffeurs/${selectedChauffeur._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      : await axios.post('http://localhost:5000/api/chauffeurs', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

    if (res.status === 200 || res.status === 201) {
      fetchChauffeurs();
      setDrawerOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setForm({
      nom: '', prenom: '', telephone: '', cin: '', adresse: '', observations: '',
      permis: { type: '', date_expiration: '' },
      contrat: { type: '', date_expiration: '' },
      visa: { actif: false, date_expiration: '' }
    });
    setScanPermis(null);
    setScanVisa(null);
    setScanCIN(null);
    setSelectedChauffeur(null);
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const getDateColor = (dateStr?: string): string => {
    if (!dateStr) return '';
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (diff < 0) return '#d32f2f'; // rouge
    if (diff < 30) return '#f57c00'; // orange
    if (diff < 60) return '#fbc02d'; // jaune
    return '#388e3c'; // vert
  };

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={600}>Chauffeurs</Typography>
          <Button variant="contained" onClick={() => {
            setSelectedChauffeur(null);
            setDrawerOpen(true);
          }}>
            Nouveau chauffeur
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Permis</strong></TableCell>
                <TableCell><strong>Visa</strong></TableCell>
                <TableCell><strong>Contrat</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chauffeurs.map(c => (
                <TableRow key={c._id} hover>
                  <TableCell>{`${c.nom} ${c.prenom}`}</TableCell>
                  <TableCell>{`${c.permis.type}:${c.cin}`}</TableCell>
                  <TableCell sx={{ color: getDateColor(c.visa.date_expiration), fontWeight: 'bold' }}>
                    {formatDate(c.visa.date_expiration)}
                  </TableCell>
                  <TableCell sx={{ color: getDateColor(c.contrat.date_expiration), fontWeight: 'bold' }}>
                    {formatDate(c.contrat.date_expiration)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton onClick={() => {
                        setSelectedChauffeur(c);
                        setForm(c);
                        setDrawerOpen(true);
                      }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton onClick={() => handleDelete(c._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>
              {selectedChauffeur ? 'Modifier Chauffeur' : 'Ajouter Chauffeur'}
            </Typography>
            <TextField label="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="CIN" value={form.cin} onChange={e => setForm({ ...form, cin: e.target.value })} fullWidth sx={{ mb: 1 }} />
            <TextField label="Type Permis" value={form.permis.type} onChange={e => setForm({ ...form, permis: { ...form.permis, type: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Permis" value={form.permis.date_expiration} onChange={e => setForm({ ...form, permis: { ...form.permis, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Contrat" value={form.contrat.date_expiration} onChange={e => setForm({ ...form, contrat: { ...form.contrat, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />
            <TextField type="date" label="Expiration Visa" value={form.visa.date_expiration} onChange={e => setForm({ ...form, visa: { ...form.visa, date_expiration: e.target.value } })} fullWidth sx={{ mb: 1 }} />

            {/* Upload fichiers, non affichés dans le tableau */}
            <Box mt={2}>
              <Typography variant="subtitle2">Fichiers optionnels :</Typography>
              <input type="file" onChange={(e) => setScanPermis(e.target.files?.[0] || null)} />
              <input type="file" onChange={(e) => setScanVisa(e.target.files?.[0] || null)} />
              <input type="file" onChange={(e) => setScanCIN(e.target.files?.[0] || null)} />
            </Box>

            <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
              {selectedChauffeur ? 'Modifier' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </Layout>
  );
};

export default ChauffeursPage;
