// DossierJuridique.tsx

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  IconButton, Drawer, Snackbar, Alert, Tooltip, TextField
} from '@mui/material';
import { InsertDriveFile, AddCircleOutline } from '@mui/icons-material';
import axios from '../../utils/axios'; // Assurez-vous que vous avez cette configuration Axios
import Layout from '../../components/Layout'; // Assurez-vous d'avoir ce composant Layout

interface Dossier {
  modelJ?: string;
  statut?: string;
  rc?: string;
  identifiantFiscale?: string;
  cinGerant?: string;
  doc1007?: string;
  [key: string]: string | undefined;
}

const DossierJuridique: React.FC = () => {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [customDocs, setCustomDocs] = useState<{ name: string, file: File | null }[]>([]);

  useEffect(() => {
    fetchDossier();
  }, []);

  const fetchDossier = async () => {
    const res = await axios.get('/api/dossier-juridique');
    setDossier(res.data?.data || res.data); // Ajustez en fonction de votre API
  };

  const handleView = (fileName: string | undefined) => {
    if (!fileName) return;
    setSelectedDoc(`https://mme-backend.onrender.com/uploads/juridique/${fileName}`);
    setOpenDialog(true);
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleUpload = async () => {
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });
    customDocs.forEach((doc, i) => {
      if (doc.file) formData.append(`custom_${doc.name || 'doc' + i}`, doc.file);
    });

    try {
      const res = await axios.post('/api/dossier-juridique', formData);
      console.log('Upload response:', res.data);
      if (res.status === 201) {
        setFiles({});
        setCustomDocs([]);
        fetchDossier(); // 🔁 recharge les données
        setDrawerOpen(false);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Erreur d'upload", err);
    }
  };

  const rows = [
    { label: 'Model J', field: dossier?.modelJ },
    { label: 'Statut', field: dossier?.statut },
    { label: 'RC', field: dossier?.rc },
    { label: 'Identifiant Fiscale', field: dossier?.identifiantFiscale },
    { label: 'CIN Gérant', field: dossier?.cinGerant },
    { label: '1007', field: dossier?.doc1007 }
  ];

  return (
    <Layout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={600}>Dossier Juridique</Typography>
          <Button variant="contained" onClick={() => setDrawerOpen(true)}>Ajouter / Modifier</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>
                    {row.field ? (
                      <Tooltip title="Voir le document">
                        <IconButton onClick={() => handleView(row.field)} sx={{ color: '#0288d1' }}>
                          <InsertDriveFile />
                        </IconButton>
                      </Tooltip>
                    ) : 'Non disponible'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Visualiser le document</DialogTitle>
          <DialogContent>
            {selectedDoc && (
              <>
                <Box component="iframe" src={selectedDoc} width="100%" height="600px" />
                <Button href={selectedDoc} target="_blank" download fullWidth variant="outlined" sx={{ mt: 2 }}>
                  Télécharger
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={3}>Documents à importer</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {['modelJ', 'statut', 'rc', 'identifiantFiscale', 'cinGerant', 'doc1007'].map(name => (
                <Box key={name}>
                  <Typography fontWeight={500}>{name}</Typography>
                  <input
                    type="file"
                    onChange={e => handleFileChange(name, e.target.files?.[0] || null)}
                    style={{ width: '100%' }}
                  />
                </Box>
              ))}

              <Typography variant="subtitle1" fontWeight={600} mt={2}>Ajouter d'autres documents :</Typography>
              {customDocs.map((doc, i) => (
                <Box key={i}>
                  <TextField
                    label="Nom du document"
                    value={doc.name}
                    onChange={(e) => {
                      const updated = [...customDocs];
                      updated[i].name = e.target.value;
                      setCustomDocs(updated);
                    }}
                    fullWidth
                    margin="dense"
                  />
                  <input
                    type="file"
                    onChange={e => {
                      const updated = [...customDocs];
                      updated[i].file = e.target.files?.[0] || null;
                      setCustomDocs(updated);
                    }}
                    style={{ width: '100%' }}
                  />
                </Box>
              ))}

              <Button startIcon={<AddCircleOutline />} onClick={() => setCustomDocs([...customDocs, { name: '', file: null }])}>
                Ajouter un champ
              </Button>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleUpload}
                disabled={Object.values(files).every(f => f === null) && customDocs.length === 0}
              >
                ENREGISTRER
              </Button>
            </Box>
          </Box>
        </Drawer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            Documents juridiques enregistrés avec succès ✅
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default DossierJuridique;
