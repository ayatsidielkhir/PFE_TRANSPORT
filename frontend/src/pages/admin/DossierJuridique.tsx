import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  IconButton, Drawer, Snackbar, Alert
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import axios from '../../utils/axios';
import Layout from '../../components/Layout';

interface Dossier {
  modelJ?: string;
  statut?: string;
  rc?: string;
  identifiantFiscale?: string;
  cinGerant?: string;
  doc1007?: string;
}

const DossierJuridique: React.FC = () => {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchDossier();
  }, []);

  const fetchDossier = async () => {
    const res = await axios.get('/api/dossier-juridique');
    setDossier(res.data);
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

    try {
      const res = await axios.post('/api/dossier-juridique', formData);
      if (res.status === 201) {
        setFiles({});
        fetchDossier();
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
      <Box p={4} maxWidth="1200px" mx="auto">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Dossier Juridique
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDrawerOpen(true)}
            sx={{
              backgroundColor: '#001e61',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              '&:hover': { backgroundColor: '#001447' }
            }}
          >
            Ajouter / Modifier
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#001e61' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#001e61' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f9fbfd',
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <TableCell>{row.label}</TableCell>
                  <TableCell>
                    {row.field ? (
                      <IconButton onClick={() => handleView(row.field)}>
                        <Visibility sx={{ color: '#001e61' }} />
                      </IconButton>
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
                <Button
                  href={selectedDoc}
                  target="_blank"
                  download
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Télécharger
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Documents à importer
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {[
                { label: 'Model J', name: 'modelJ' },
                { label: 'Statut', name: 'statut' },
                { label: 'RC', name: 'rc' },
                { label: 'Identifiant Fiscale', name: 'identifiantFiscale' },
                { label: 'CIN Gérant', name: 'cinGerant' },
                { label: '1007', name: 'doc1007' }
              ].map(({ label, name }) => (
                <Box key={name}>
                  <Typography fontWeight={500} mb={0.5}>{label}</Typography>
                  <input
                    type="file"
                    onChange={e => handleFileChange(name, e.target.files?.[0] || null)}
                    style={{
                      border: '1px solid #ccc',
                      padding: '8px',
                      borderRadius: '6px',
                      width: '100%',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={Object.values(files).every(f => f === null)}
                sx={{
                  mt: 2,
                  backgroundColor: '#001e61',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#001447' }
                }}
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
