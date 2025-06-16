import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Button, IconButton, Drawer, TextField, InputAdornment, Tooltip, Dialog, DialogContent,
  DialogTitle
} from '@mui/material';
import { Description, Add, Search as SearchIcon, Edit, Delete } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';
import { Visibility } from '@mui/icons-material';

const API = process.env.REACT_APP_API_URL;

interface Dossier {
  [key: string]: string;
}

const DossierJuridique: React.FC = () => {
  const [dossier, setDossier] = useState<Dossier>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', file: null as File | null });
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);

  const fetchDossier = async () => {
    const res = await axios.get(`${API}/dossier-juridique`);
    setDossier(res.data);
    console.log('📁 Données reçues sans les champs système :', res.data);
  };

  useEffect(() => { fetchDossier(); }, []);

  const handleUpload = async () => {
    const formData = new FormData();
    const key = editKey ? editKey : `custom_${form.name}`;
    if (form.file) formData.append(key, form.file);

    await axios.post(`${API}/dossier-juridique`, formData);
    setDrawerOpen(false);
    setForm({ name: '', file: null });
    setEditKey(null);
    setSearch('');
    fetchDossier();
  };

  const handlePreview = (fileName: string) => {
    setPreviewFile(`${API}/uploads/juridique/${fileName}`);
  };

  const filtered = Object.entries(dossier).filter(([key]) =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (key: string) => {
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le document "${key}" ?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API}/dossier-juridique/${key}`);
      fetchDossier();
    } catch (err) {
      console.error('Erreur lors de la suppression', err);
    }
  };

  return (
    <Layout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001e61" mb={3} display="flex" alignItems="center" gap={1}>
          <Description sx={{ fontSize: 32 }} />
          Dossier Juridique de l'Entreprise
        </Typography>

        <Paper elevation={2} sx={{
          p: 2, mb: 3, backgroundColor: '#e3f2fd',
          borderRadius: 2, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap'
        }}>
          <TextField
            size="small"
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setDrawerOpen(true);
              setEditKey(null);
              setForm({ name: '', file: null });
            }}
            sx={{
              backgroundColor: '#001e61',
              '&:hover': { backgroundColor: '#1565c0' },
              borderRadius: 2,
              fontWeight: 'bold',
              height: 40,
              textTransform: 'none'
            }}
          >
            Ajouter un document
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#001e61' }}>Type de document</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#001e61' }}>Fichier</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#001e61' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(([key, value], i) => (
                <TableRow key={key} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd' }}>
                  <TableCell>{key.replace('custom_', '').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}</TableCell>
                    <TableCell>
                      <Tooltip title="Prévisualiser le document">
                        <IconButton
                          onClick={() => handlePreview(value)}
                          sx={{ color: '#1976d2' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton onClick={() => {
                        setEditKey(key);
                        setForm({ name: key.replace('custom_', ''), file: null });
                        setDrawerOpen(true);
                      }} sx={{ color: '#001e61' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                      <Tooltip title="Supprimer">
                          <IconButton onClick={() => handleDelete(key)}  sx={{ color: '#d32f2f' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => {
          setDrawerOpen(false);
          setEditKey(null);
        }}>
          <Box p={3} mt={10} width={{ xs: '100vw', sm: 400 }} >
            <Typography variant="h6" fontWeight="bold" color="#001e61" mb={2} >
              {editKey ? 'Modifier le document' : 'Ajouter un document'}
            </Typography>
            <TextField
              label="Nom du document"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              disabled={!!editKey}
            />
            <Button variant="outlined" component="label" fullWidth>
              Télécharger le fichier
              <input type="file" hidden onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} />
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              fullWidth
              sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' }, fontWeight: 'bold' }}
              disabled={!form.file}
            >
              Enregistrer
            </Button>
          </Box>
        </Drawer>

        {/* Aperçu PDF */}
          <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth>
          <DialogTitle>Prévisualisation</DialogTitle>
          <DialogContent>
            {previewFile && (
              <Box component="iframe" src={previewFile} width="100%" height="600px" />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default DossierJuridique;
