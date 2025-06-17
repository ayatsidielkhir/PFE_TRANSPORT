import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper, useMediaQuery
} from '@mui/material';
import {
  Delete, Edit, Search as SearchIcon, PictureAsPdf, Add,
  FileDownload, SortByAlpha, Person
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { useTheme } from '@mui/material/styles';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { FolderOpen } from '@mui/icons-material';


interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  adresse?: string;
  photo?: string;
  scanCIN?: string;
  scanPermis?: string;
  scanVisa?: string;
  certificatBonneConduite?: string;
}

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDocsModal, setOpenDocsModal] = useState(false);
  const [docsChauffeur, setDocsChauffeur] = useState<Chauffeur | null>(null);

  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Record<string, string | File>>({});

  const perPage = 5;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchChauffeurs = async () => {
    const res = await axios.get('https://mme-backend.onrender.com/api/chauffeurs');
    setChauffeurs(res.data);
  };

  useEffect(() => {
    fetchChauffeurs();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files?.[0] || value
    }));

    if (name === 'photo' && files?.[0]) {
      setPreviewPhoto(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
  if (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'type' in value
  ) {
    formData.append(key, value as File);
  } else if (typeof value === 'string') {
    formData.append(key, value);
  }
});


    try {
      if (selectedChauffeur) {
        await axios.put(`https://mme-backend.onrender.com/api/chauffeurs/${selectedChauffeur._id}`, formData);
      } else {
        await axios.post('https://mme-backend.onrender.com/api/chauffeurs', formData);
      }
      fetchChauffeurs();
      setDrawerOpen(false);
    } catch (err) {
      console.error('Erreur lors de la soumission', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await axios.delete(`https://mme-backend.onrender.com/api/chauffeurs/${id}`);
      fetchChauffeurs();
    } catch (err) {
      console.error('Erreur de suppression', err);
    }
  };

  const handleEdit = (chauffeur: Chauffeur) => {
  setSelectedChauffeur(chauffeur);
  const formatted: Record<string, string> = {
    nom: chauffeur.nom || '',
    prenom: chauffeur.prenom || '',
    telephone: chauffeur.telephone || '',
    cin: chauffeur.cin || '',
    adresse: chauffeur.adresse || '',
    photo: chauffeur.photo || '',
    scanCIN: chauffeur.scanCIN || '',
    scanPermis: chauffeur.scanPermis || '',
    scanVisa: chauffeur.scanVisa || '',
    certificatBonneConduite: chauffeur.certificatBonneConduite || ''
  };
  setForm(formatted);
  setPreviewPhoto(`https://mme-backend.onrender.com/uploads/chauffeurs/${chauffeur.photo}`);
  setDrawerOpen(true);
};
const handleVoirDocs = (chauffeur: Chauffeur) => {
  setDocsChauffeur(chauffeur);
  setOpenDocsModal(true);
};



  const resetForm = () => {
    setForm({});
    setSelectedChauffeur(null);
    setPreviewPhoto(null);
  };

  const renderDocumentAvatar = (file?: string) => {
    if (!file) return '—';
    const url = `https://mme-backend.onrender.com/uploads/chauffeurs/${file}`;
    return (
      <Tooltip title="Voir le PDF">
        <IconButton onClick={() => (setDialogImageSrc(url), setOpenDialog(true))}>
          <PictureAsPdf sx={{ fontSize: 25, color: 'red' }} />
        </IconButton>
      </Tooltip>
    );
  };

  const filtered = chauffeurs
    .filter(c => c.nom.toLowerCase().includes(search.toLowerCase()) || c.prenom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortAsc ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom));

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const exportExcel = () => {
    const data = chauffeurs.map(c => ({
      Nom: c.nom, Prénom: c.prenom, Téléphone: c.telephone, CIN: c.cin
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chauffeurs');
    XLSX.writeFile(wb, 'chauffeurs.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Nom', 'Prénom', 'Téléphone', 'CIN']],
      body: chauffeurs.map(c => [c.nom, c.prenom, c.telephone, c.cin]),
    });
    doc.save('chauffeurs.pdf');
  };

  return (
    <AdminLayout>
      <Box p={isMobile ? 1 : 2}>
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3} display="flex" alignItems="center" gap={1}>
          <Person sx={{ width: 45, height: 32 }} />
          Gestion Des Chauffeurs
        </Typography>

        <Paper
  elevation={2}
  sx={{
    p: 2,
    mb: 3,
    backgroundColor: '#e3f2fd',
    borderRadius: 2,
  }}
>
  <Box
    display="flex"
    flexDirection={isMobile ? 'column' : 'row'}
    justifyContent="space-between"
    alignItems={isMobile ? 'stretch' : 'center'}
    gap={isMobile ? 2 : 0}
  >
    <TextField
      size="small"
      placeholder="Rechercher un chauffeur..."
      value={search}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{
        width: isMobile ? '100%' : '35%',
        backgroundColor: 'white',
        borderRadius: 1,
      }}
    />

    <Button
      variant="contained"
      startIcon={<Add />}
      onClick={() => { setDrawerOpen(true); resetForm(); }}
      sx={{
        backgroundColor: '#001e61',
        borderRadius: 3,
        textTransform: 'none',
        fontWeight: 'bold',
        px: 3,
        boxShadow: 2,
        '&:hover': { backgroundColor: '#001447' },
        width: isMobile ? '100%' : 'auto'
      }}
    >
      Ajouter un chauffeur
    </Button>
  </Box>
</Paper>


        <Paper elevation={3} sx={{ borderRadius: 2, p: 2, backgroundColor: 'white', boxShadow: 3 }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {['Photo', 'Nom', 'Prénom', 'Téléphone', 'CIN', 'Adresse','Docs', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell><Avatar src={`https://mme-backend.onrender.com/uploads/chauffeurs/${c.photo}`} sx={{ width: 55, height: 45 }} /></TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell>{c.cin}</TableCell>
                  <TableCell>{c.adresse}</TableCell>
                    <TableCell>
                      <Tooltip title="Voir les documents">
                        <IconButton onClick={() => handleVoirDocs(c)}>
                          <FolderOpen />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(filtered.length / perPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Visualisation PDF</DialogTitle>
        <DialogContent>
          <iframe
            src={dialogImageSrc || ''}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
          <Box mt={2} textAlign="right">
            <Button
              onClick={() => window.open(dialogImageSrc || '', '_blank')}
              variant="outlined"
              color="primary"
            >
              Télécharger
            </Button>
          </Box>
        </DialogContent>
      </Dialog>



<Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  <Box p={3} width={isMobile ? '100vw' : 450}>
    <Box display="flex" justifyContent="center" mb={3} mt={5}>
      <label htmlFor="photo-input">
        <Avatar
          src={previewPhoto || ''}
          sx={{
            width: 110,
            height: 110,
            cursor: 'pointer',
            borderRadius: '50%',
            boxShadow: 2,
            backgroundColor: '#f0f0f0',
            mt: 6,
            marginTop: '28px'
          }}
        />
      </label>
      <input
        id="photo-input"
        name="photo"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </Box>

    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
      {['nom', 'prenom', 'telephone', 'cin', 'adresse'].map(field => (
        <Box key={field} flex="1 1 45%">
          <TextField
            fullWidth
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            value={form[field] as string || ''}
            onChange={handleInputChange}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '12px',
                backgroundColor: '#f9fafb'
              }
            }}
          />
        </Box>
      ))}
    </Box>

    <Box display="flex" flexWrap="wrap" gap={2}>
      {[
        { name: 'scanCIN', label: 'Scan CIN' },
        { name: 'scanPermis', label: 'Scan Permis' },
        { name: 'scanVisa', label: 'Scan Visa' },
        { name: 'certificatBonneConduite', label: 'Extrait de Casier Judiciaire' }
      ].map(({ name, label }) => (
        <Box key={name} flex="1 1 45%">
          <Typography fontWeight={500} mb={0.5}>{label}</Typography>
          <Button
            component="label"
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              textTransform: 'none',
              fontSize: '14px',
              py: 1
            }}
          >
            {form[name] instanceof File ? (form[name] as File).name : 'Choisir un fichier'}
            <input
              type="file"
              name={name}
              hidden
              onChange={handleInputChange}
            />
          </Button>
        </Box>
      ))}
    </Box>

    <Button
      fullWidth
      variant="contained"
      onClick={handleSubmit}
      sx={{
        mt: 4,
        backgroundColor: '#001e61',
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 'bold',
        py: 1.5,
        fontSize: '16px',
        '&:hover': { backgroundColor: '#001447' }
      }}
    >
      {selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}
    </Button>
  </Box>
</Drawer>

<Dialog open={openDocsModal} onClose={() => setOpenDocsModal(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Documents du Chauffeur</DialogTitle>
  <DialogContent>
    {docsChauffeur && (
      <Box display="flex" flexWrap="wrap" gap={2}>
        {[
          { key: 'scanCIN', label: 'Scan CIN' },
          { key: 'scanPermis', label: 'Scan Permis' },
          { key: 'scanVisa', label: 'Visa' },
          { key: 'certificatBonneConduite', label: 'Casier Judiciaire' }
        ].map(({ key, label }) => (
          <Box key={key} textAlign="center">
            <Typography fontSize={14} fontWeight={500}>{label}</Typography>
            {renderDocumentAvatar((docsChauffeur as any)[key])}
          </Box>
        ))}
      </Box>
    )}
  </DialogContent>
</Dialog>


    </AdminLayout>
  );
};

export default ChauffeursPage;