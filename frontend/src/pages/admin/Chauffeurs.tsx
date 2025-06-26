import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, Typography, InputAdornment, Paper
} from '@mui/material';
import { Delete, Edit, Search as SearchIcon, Add } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;

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

const extractTextFromImage = async (file: File): Promise<Partial<Record<string, string>>> => {
  let pageTexts: string[] = [];

  if (file.type === 'application/pdf') {
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Impossible de créer un contexte canvas.");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const imageSource = canvas.toDataURL();

      const result = await Tesseract.recognize(imageSource, 'fra', {
        logger: m => console.log(`Page ${pageNumber}:`, m),
      });

      console.log(`===== PAGE ${pageNumber} OCR TEXT =====`);
      console.log(result.data.text);

      pageTexts.push(result.data.text);
    }
  }

  const fullText = pageTexts.join('\n');
  const page2 = pageTexts[1] || '';

  // === Extraire nom/prénom depuis ligne MRZ (type passeport)
  let nom = '', prenom = '';

// Recherche d'une ligne MRZ avec <<
const mrzLine = fullText.split('\n').find(l => l.includes('<<'));

if (mrzLine) {
  const parts = mrzLine.trim().split('<<');
  nom = parts[0]?.replace(/</g, ' ').trim() || '';
  prenom = parts[1]?.replace(/</g, ' ').trim() || '';
}



  // === CIN
  const cinMatch = fullText.match(/[A-Z]{1,2}\d{5,8}/i);
  const cin = cinMatch?.[0] || '';

  // === Date d’expiration CIN
  const dateMatches = Array.from(fullText.matchAll(/(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})/g));
  let expirationDate = '';
  if (dateMatches.length >= 2) {
    const [_, d, m, y] = dateMatches[1];
    expirationDate = `${y}-${m}-${d}`;
  }

  // === Adresse (aucune ligne fiable, donc vide ou ligne personnalisée possible)
  let adresse = '';
  const adresseLigne = page2.split('\n').find(l => /(hay|bloc|résidence|appt|rue)/i.test(l));
  if (adresseLigne) adresse = adresseLigne;

  return {
    nom,
    prenom,
    cin,
    dateExpirationCIN: expirationDate,
    adresse
  };
};







const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [form, setForm] = useState({
  nom: '',
  prenom: '',
  telephone: '',
  cin: '',
  adresse: '',
  dateExpirationCIN: '',
  photo: null,
  scanCIN: null,
  scanPermis: null,
  scanVisa: null,
  certificatBonneConduite: null
} as Record<string, string | Blob | null>);


  const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  const renderDocumentAvatar = (file: string | undefined) => {
    if (!file) return '—';
    const url = `http://localhost:5000/uploads/chauffeurs/${file}`;
    return (
      <Avatar
        src={isImageFile(file) ? url : '/pdf-icon.png'}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => { setDialogImageSrc(url); setOpenDialog(true); }}
      />
    );
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('http://localhost:5000/api/chauffeurs');
    setChauffeurs(res.data);
  };

  useEffect(() => { fetchChauffeurs(); }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, files } = e.target;

  if (files) {
    const file = files[0];

    // Prévisualisation si c’est une photo
    if (name === 'photo') {
      setPreviewPhoto(URL.createObjectURL(file));
    }

    // On met à jour le champ fichier dans le form
    setForm(prev => ({ ...prev, [name]: file }));

    // Si c'est un scan de CIN, on lance l'extraction OCR
    if (name === 'scanCIN') {
      const extractedData = await extractTextFromImage(file);

      console.log("✅ Données extraites OCR :", extractedData); // 🔍 Ajoute ça si pas déjà fait

      setForm(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(extractedData).map(([k, v]) => [k, v ?? '']) // ✅ important : jamais null
        )
      }));
    }
  } else {
    // Mise à jour des champs texte manuellement tapés
    setForm(prev => ({ ...prev, [name]: value }));
  }
};

  const handleSubmit = async () => {
  if (!form.nom || !form.prenom || !form.telephone || !form.cin) {
    alert('Veuillez remplir les champs obligatoires.');
    return;
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });

  const url = selectedChauffeur
    ? `http://localhost:5000/api/chauffeurs/${selectedChauffeur._id}`
    : `http://localhost:5000/api/chauffeurs`;

  const method = selectedChauffeur ? axios.put : axios.post;

  try {
    await method(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    fetchChauffeurs();
    resetForm();
    setDrawerOpen(false);
  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'enregistrement");
  }
};


  const handleEdit = (chauffeur: Chauffeur) => {
    setSelectedChauffeur(chauffeur);
    setForm({
      nom: chauffeur.nom,
      prenom: chauffeur.prenom,
      telephone: chauffeur.telephone,
      cin: chauffeur.cin,
      adresse: chauffeur.adresse || '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });
    setPreviewPhoto(null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce chauffeur ?")) return;
    await axios.delete(`http://localhost:5000/api/chauffeurs/${id}`);
    fetchChauffeurs();
  };

  const resetForm = () => {
    setForm({
      nom: '', prenom: '', telephone: '', cin: '', adresse: '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });
    setSelectedChauffeur(null);
    setPreviewPhoto(null);
  };

  const filtered = chauffeurs.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Gestion des Chauffeurs
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
              )
            }}
            sx={{ width: '35%', backgroundColor: 'white', borderRadius: 1 }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              backgroundColor: '#001e61',
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              px: 3,
              boxShadow: 2,
              '&:hover': { backgroundColor: '#001447' }
            }}
            onClick={() => { setDrawerOpen(true); resetForm(); }}
          >
            Ajouter un chauffeur
          </Button>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Photo", "Nom", "Prénom", "Téléphone", "Adresse", "CIN", "Permis", "Visa", "Certificat", "Actions"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((c, i) => (
                <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{renderDocumentAvatar(c.photo)}</TableCell>
                  <TableCell>{c.nom}</TableCell>
                  <TableCell>{c.prenom}</TableCell>
                  <TableCell>{c.telephone}</TableCell>
                  <TableCell>{c.cin}</TableCell>
                  <TableCell>{c.adresse}</TableCell>
                  <TableCell>{renderDocumentAvatar(c.scanCIN)}</TableCell>
                  <TableCell>{renderDocumentAvatar(c.scanPermis)}</TableCell>
                  <TableCell>{renderDocumentAvatar(c.scanVisa)}</TableCell>
                  <TableCell>{renderDocumentAvatar(c.certificatBonneConduite)}</TableCell>
                  <TableCell>
                    <Tooltip title="Modifier"><IconButton sx={{ color: '#001e61' }} onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Supprimer"><IconButton sx={{ color: '#d32f2f' }} onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
          <DialogTitle>Visualiser le document</DialogTitle>
          <DialogContent>
            <Box component="img" src={dialogImageSrc} alt="document" width="100%" />
          </DialogContent>
        </Dialog>


              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  <Box p={3} width={400} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    
    <Box>
      {/* Image */}
      <Box display="flex" justifyContent="center" mb={3} mt={10}>
        <label htmlFor="photo">
          <Avatar
            src={previewPhoto || ''}
            sx={{
              width: 110,
              height: 110,
              cursor: 'pointer',
              borderRadius: '50%',
              boxShadow: 2,
              backgroundColor: '#f0f0f0'
            }}
          />
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Inputs 2 colonnes */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
        {['nom', 'prenom', 'telephone', 'cin'].map((field) => (
          <Box key={field} flex="1 1 45%">
            <TextField
              name={field}
              value={(form[field] || '') as string}
              onChange={handleInputChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              fullWidth
              sx={{
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Adresse pleine largeur */}
      <TextField
        name="adresse"
        value={form.adresse || ''}
        onChange={handleInputChange}
        placeholder="Adresse"
        fullWidth
        sx={{
          mb: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2
          }
        }}
      />
      {/* Date d’expiration CIN */}
      <TextField
        label="Date d’expiration CIN"
        type="date"
        name="dateExpirationCIN"
        value={form.dateExpirationCIN || ''}
        onChange={handleInputChange}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          mb: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2
          }
        }}
      />


      {/* Fichiers */}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {[
          { label: 'Scan CIN', name: 'scanCIN' },
          { label: 'Scan Permis', name: 'scanPermis' },
          { label: 'Scan Visa', name: 'scanVisa' },
          { label: 'Extrait de Casier Judiciaire', name: 'certificatBonneConduite' }
        ].map(({ label, name }) => (
          <Box key={name} flex="1 1 45%">
            <Typography variant="body2" fontWeight={500} mb={0.5}>{label}</Typography>
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                color: '#0d47a1',
                borderColor: '#90caf9',
                '&:hover': { borderColor: '#0d47a1' }
              }}
            >
              Choisir un fichier
              <input type="file" hidden name={name} onChange={handleInputChange} />
            </Button>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Bouton principal */}
    <Button
      fullWidth
      variant="contained"
      onClick={handleSubmit}
      sx={{
        mt: 3,
        backgroundColor: '#001e61',
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        py: 1.2,
        '&:hover': { backgroundColor: '#001447' }
      }}
    >
      {selectedChauffeur ? 'Mettre à jour' : 'Ajouter'}
    </Button>
  </Box>
</Drawer>

      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;