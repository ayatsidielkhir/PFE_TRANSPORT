// ✅ Page Véhicules avec style moderne, drawer amélioré, responsive, gestion des documents, docs modal, chauffeur affiché, filtre par chauffeur

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper, useMediaQuery,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, PictureAsPdf, Add, DriveEta, FolderOpen } from '@mui/icons-material';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';

interface Vehicule {
  _id?: string;
  nom: string;
  matricule: string;
  type: string;
  kilometrage: number;
  controle_technique: string;
  assurance?: string;
  carteGrise?: string;
  vignette?: string;
  agrement?: string;
  carteVerte?: string;
  extincteur?: string;
  photoVehicule?: string;
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
  const [chauffeurFilter, setChauffeurFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDocsDialog, setOpenDocsDialog] = useState(false);
  const [docsVehicule, setDocsVehicule] = useState<Vehicule | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<Record<string, string | File | null>>({
    nom: '', matricule: '', type: '', kilometrage: '', controle_technique: '',
    photoVehicule: null, assurance: null, carteGrise: null, vignette: null,
    agrement: null, carteVerte: null, extincteur: null, chauffeur: ''
  });

  const fetchVehicules = async () => {
    const res = await axios.get('/vehicules');
    setVehicules(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/chauffeurs');
    setChauffeurs(res.data);
  };

  useEffect(() => {
    fetchVehicules();
    fetchChauffeurs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (vehicule: Vehicule) => {
    setSelectedVehicule(vehicule);
    setForm({
      nom: vehicule.nom,
      matricule: vehicule.matricule,
      type: vehicule.type,
      kilometrage: vehicule.kilometrage.toString(),
      controle_technique: vehicule.controle_technique,
      photoVehicule: null,
      assurance: null,
      carteGrise: null,
      vignette: null,
      agrement: null,
      carteVerte: null,
      extincteur: null,
      chauffeur: vehicule.chauffeur || ''
    });
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer ce véhicule ?")) {
      await axios.delete(`/vehicules/${id}`);
      fetchVehicules();
    }
  };

  const filtered = vehicules.filter(v => {
    const chauffeurMatch = chauffeurFilter ? v.chauffeur === chauffeurFilter : true;
    const textMatch =
      v.nom.toLowerCase().includes(search.toLowerCase()) ||
      v.matricule.toLowerCase().includes(search.toLowerCase());
    return chauffeurMatch && textMatch;
  });
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getChauffeurName = (id?: string) => {
    const ch = chauffeurs.find(c => c._id === id);
    return ch ? `${ch.nom} ${ch.prenom}` : '—';
  };

  const renderDocumentAvatar = (file?: string) => {
    if (!file) return '—';
    const url = `https://mme-backend.onrender.com/uploads/vehicules/${file}`;
    if (/\.pdf$/i.test(file)) {
      return (
        <Tooltip title="Voir le PDF">
          <IconButton onClick={() => window.open(url)} sx={{ color: '#d32f2f' }}>
            <PictureAsPdf />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Avatar
        variant="rounded"
        src={url}
        sx={{ width: 35, height: 45, cursor: 'pointer', border: '1px solid #ccc' }}
        onClick={() => { setDialogImageSrc(url); setOpenDialog(true); }}
      />
    );
  };

  const handleDocsClick = (vehicule: Vehicule) => {
    setDocsVehicule(vehicule);
    setOpenDocsDialog(true);
  };

  return (
    <AdminLayout>
      <Box p={isMobile ? 1 : 2}>
         <AdminLayout>
      <Box p={isMobile ? 1 : 2}>
        <Box mb={2} display={isMobile ? 'block' : 'flex'} gap={2}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ width: isMobile ? '100%' : '50%' }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filtrer par chauffeur</InputLabel>
            <Select
              value={chauffeurFilter}
              onChange={(e) => setChauffeurFilter(e.target.value)}
              label="Filtrer par chauffeur"
            >
              <MenuItem value="">Tous</MenuItem>
              {chauffeurs.map(c => (
                <MenuItem key={c._id} value={c._id}>{c.nom} {c.prenom}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Chauffeur</TableCell>
              <TableCell>Carte Grise</TableCell>
              <TableCell>Assurance</TableCell>
              <TableCell>Docs</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(v => (
              <TableRow key={v._id}>
                <TableCell>{v.nom}</TableCell>
                <TableCell>{v.matricule}</TableCell>
                <TableCell>{getChauffeurName(v.chauffeur)}</TableCell>
                <TableCell>{renderDocumentAvatar(v.carteGrise)}</TableCell>
                <TableCell>{renderDocumentAvatar(v.assurance)}</TableCell>
                <TableCell>
                  <Tooltip title="Autres documents">
                    <IconButton onClick={() => handleDocsClick(v)}><FolderOpen /></IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(v)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(v._id!)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={openDocsDialog} onClose={() => setOpenDocsDialog(false)}>
          <DialogTitle>Autres documents</DialogTitle>
          <DialogContent>
            {docsVehicule && ["vignette", "agrement", "carteVerte", "extincteur"].map(field => (
              <Box key={field} mb={1}>
                <Typography variant="body2" fontWeight={600}>{field}</Typography>
                {renderDocumentAvatar(docsVehicule[field as keyof Vehicule] as string)}
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      </Box>
    </AdminLayout>
      </Box>
    </AdminLayout>
  );
};

export default VehiculesPage;

