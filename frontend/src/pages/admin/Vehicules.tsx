import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add, PictureAsPdf } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';

interface Vehicule {
  _id?: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  controle_technique: string;
  assurance: string;
  carteGrise: string;
  vignette?: string;
  agrement?: string;
  carteVerte?: string;
  extincteur?: string;
  photo?: string;
  chauffeur?: string;
}

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

const VehiculesPage: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehiculeDocs, setSelectedVehiculeDocs] = useState<Vehicule | null>(null);
  const perPage = 5;
  const BACKEND_URL = 'https://mme-backend.onrender.com';

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const fetchVehicules = async () => {
    const res = await axios.get('/api/vehicules');
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/api/chauffeurs');
    setChauffeurs(res.data);
  };

  const renderDocument = (file?: string) => {
    if (!file) return '—';
    const url = `${BACKEND_URL}/uploads/vehicules/${file}`;
    if (/(.png|.jpg|.jpeg)$/i.test(file)) {
      return <Avatar src={url} sx={{ width: 40, height: 40 }} onClick={() => window.open(url, '_blank')} />;
    }
    if (/\.pdf$/i.test(file)) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url, '_blank')}>
            <PictureAsPdf color="error" />
          </IconButton>
        </Tooltip>
      );
    }
    return <a href={url} target="_blank" rel="noopener noreferrer">📎</a>;
  };

  const renderVoirPlus = (vehicule: Vehicule) => {
    const otherDocs = [vehicule.agrement, vehicule.carteVerte, vehicule.extincteur];
    const hasDocs = otherDocs.some(doc => doc);
    if (!hasDocs) return '—';
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setSelectedVehiculeDocs(vehicule);
          setDialogOpen(true);
        }}
      >
        ...
      </Button>
    );
  };

  const filtered = vehicules.filter(v =>
    v.nom?.toLowerCase().includes(search.toLowerCase()) ||
    v.matricule?.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Gestion des Véhicules
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: '35%', backgroundColor: 'white', borderRadius: 1 }}
          />
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Photo", "Nom", "Matricule", "Type", "Km", "CT", "Carte Grise", "Assurance", "Vignette", "Autres Docs"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((v, i) => (
                <TableRow key={v._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{renderDocument(v.photo)}</TableCell>
                  <TableCell>{v.nom}</TableCell>
                  <TableCell>{v.matricule}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.kilometrage}</TableCell>
                  <TableCell>{v.controle_technique}</TableCell>
                  <TableCell>{renderDocument(v.carteGrise)}</TableCell>
                  <TableCell>{renderDocument(v.assurance)}</TableCell>
                  <TableCell>{renderDocument(v.vignette)}</TableCell>
                  <TableCell>{renderVoirPlus(v)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filtered.length / perPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Documents supplémentaires</DialogTitle>
          <DialogContent>
            {selectedVehiculeDocs && (
              <>
                {selectedVehiculeDocs.agrement && (
                  <Box mb={2}>
                    <Typography>Agrément</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.agrement}`} target="_blank">{selectedVehiculeDocs.agrement}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.carteVerte && (
                  <Box mb={2}>
                    <Typography>Carte Verte</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.carteVerte}`} target="_blank">{selectedVehiculeDocs.carteVerte}</a>
                  </Box>
                )}
                {selectedVehiculeDocs.extincteur && (
                  <Box mb={2}>
                    <Typography>Extincteur</Typography>
                    <a href={`${BACKEND_URL}/uploads/vehicules/${selectedVehiculeDocs.extincteur}`} target="_blank">{selectedVehiculeDocs.extincteur}</a>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;
