import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  IconButton, Drawer, Snackbar, Alert, Tooltip, TextField
} from '@mui/material';
import { InsertDriveFile, Delete, AddCircleOutline } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';

interface Dossier {
  [key: string]: string | undefined;
}

const DossierJuridique: React.FC = () => {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [customDocs, setCustomDocs] = useState<{ name: string, file: File | null }[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const standardDocs = ['modelJ', 'statut', 'rc', 'identifiantFiscale', 'cinGerant', 'doc1007'];

  useEffect(() => {
    fetchDossier();
  }, []);

  const fetchDossier = async () => {
    const res = await axios.get('/api/dossier-juridique');
    setDossier(res.data || {});
  };

  const handleView = (fileName: string | undefined) => {
    if (!fileName) return;
    setSelectedDoc(`https://mme-backend.onrender.com/uploads/juridique/${fileName}`);
    setOpenDialog(true);
  };

  const handleDelete = async (field: string) => {
    await axios.delete(`/api/dossier-juridique/${field}`);
    fetchDossier();
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
      if (res.status === 201) {
        setFiles({});
        setCustomDocs([]);
        setDrawerOpen(false);
        setSnackbarOpen(true);
        fetchDossier();
      }
    } catch (err) {
      console.error("Erreur d'upload", err);
    }
  };

  const allFields = dossier ? Object.entries(dossier) : [];

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
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allFields.map(([key, value], index) => (
                <TableRow key={index}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    {value ? (
                      <>
                        <Tooltip title="Voir le document">
                          <IconButton onClick={() => handleView(value)} sx={{ color: '#0288d1' }}>
                            <InsertDriveFile />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer le document">
                          <IconButton onClick={() => handleDelete(key)} sx={{ color: '#d32f2f' }}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : 'Non disponible'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Vue du document */}
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

        {/* Formulaire Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={3}>Documents à importer</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {standardDocs.map(name => (
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

        {/* Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            Documents enregistrés avec succès ✅
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default DossierJuridique;
