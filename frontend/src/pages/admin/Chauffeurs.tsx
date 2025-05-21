import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip,
  Dialog, InputAdornment
} from '@mui/material';
import { Delete, Edit, Download, Search as SearchIcon, Add } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

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
  const [filteredChauffeurs, setFilteredChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dialogImageSrc, setDialogImageSrc] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [form, setForm] = useState<Record<string, string | Blob | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

  const isImageFile = (filename: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

  const isPdfFile = (filename: string) =>
  /\.pdf$/i.test(filename);


  const renderDocumentAvatar = (file: string | undefined) => {
    if (!file) return 'N/A';
    const fileUrl = `http://localhost:5000/uploads/chauffeurs/${encodeURIComponent(file)}`;
    return (
      <Avatar
        src={isImageFile(file) ? fileUrl : '/pdf-icon.png'}
        sx={{ width: 40, height: 40, cursor: 'pointer' }}
        onClick={() => {
          setDialogImageSrc(fileUrl);
          setOpenDialog(true);
        }}
      />
    );
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('http://localhost:5000/api/chauffeurs');
    setChauffeurs(res.data);
    setFilteredChauffeurs(res.data);
  };

  useEffect(() => { fetchChauffeurs(); }, []);

  useEffect(() => {
    const filtered = chauffeurs.filter(c =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.prenom.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredChauffeurs(filtered);
    setPage(1);
  }, [search, chauffeurs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (name === 'photo') {
        setPreviewPhoto(URL.createObjectURL(file));
      }
      setForm(prev => ({ ...prev, [name]: file }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

const handleSubmit = async () => {
  if (!form.nom || !form.prenom || !form.telephone || !form.cin) {
    setErrorMsg('Tous les champs obligatoires doivent être remplis (nom, prénom, téléphone, CIN).');
    return;
  }

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value instanceof Blob || typeof value === 'string') {
      formData.append(key, value);
    }
  });

  try {
    const res = selectedChauffeur
      ? await axios.put(`http://localhost:5000/api/chauffeurs/${selectedChauffeur._id}`, formData)
      : await axios.post('http://localhost:5000/api/chauffeurs', formData);

    if (res.status === 200 || res.status === 201) {
      alert(selectedChauffeur ? 'Chauffeur modifié avec succès !' : 'Chauffeur ajouté avec succès !');
      setDrawerOpen(false);
      resetForm();
      fetchChauffeurs();
      setErrorMsg('');
    }
  } catch (err: any) {
    setErrorMsg(err.response?.data?.message || "Erreur lors de l'enregistrement du chauffeur");
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
    setErrorMsg('');
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Voulez-vous vraiment supprimer ce chauffeur ?');
    if (!confirm) return;
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

  const paginatedChauffeurs = filteredChauffeurs.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <h2>Liste Des Chauffeurs</h2>
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
          sx={{ width: '30%' }}
        />

  <Button
    variant="contained"
    startIcon={<Add />}
    sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' }, textTransform: 'none' }}
    onClick={() => { setDrawerOpen(true); resetForm(); }}
  >
    Ajouter Chauffeur
  </Button>
</Box>

        <Table>
          <TableHead>
            <TableRow>
              {["Photo", "Nom", "Prénom", "Téléphone", "CIN", "Adresse", "CIN", "Permis", "Visa", "Certificat", "Actions"].map(h => (
                <TableCell key={h} sx={{ fontWeight: 'bold' ,backgroundColor: '#e3f2fd'}}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedChauffeurs.map((c, i) => (
              <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? 'white' : '#f0fbff' }}>
                <TableCell>
                  {c.photo ? renderDocumentAvatar(c.photo) : 'N/A'}
                </TableCell>
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
                  <Tooltip title="Modifier"><IconButton onClick={() => handleEdit(c)}><Edit /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton onClick={() => handleDelete(c._id)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredChauffeurs.length / perPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>

              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box mt={8} p={3} width={400} display="flex" flexDirection="column" alignItems="center">
            {/* ✅ Upload image via Avatar */}
            <input
              type="file"
              accept="image/*"
              name="photo"
              id="avatar-upload"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
            <label htmlFor="avatar-upload">
              <Avatar
                src={
                  previewPhoto ||
                  (selectedChauffeur?.photo
                    ? `http://localhost:5000/uploads/chauffeurs/${encodeURIComponent(selectedChauffeur.photo)}`
                    : '')
                }
                alt="Chauffeur"
                sx={{
                  width: 100,
                  height: 100,
                  mb: 2,
                  cursor: 'pointer',
                  border: '2px solid #ccc',
                  '&:hover': { borderColor: '#1976d2' }
                }}
              />
            </label>

            <h3 style={{ marginBottom: '1rem' }}>
              {selectedChauffeur ? 'Modifier Chauffeur' : 'Ajouter Chauffeur'}
            </h3>

            {/* ✅ Données personnelles */}
            <Box width="100%">
              <h4 style={{ marginBottom: '0.5rem' }}>Informations personnelles</h4>
              <TextField label="Nom" name="nom" fullWidth margin="normal" value={form.nom as string} onChange={handleInputChange} />
              <TextField label="Prénom" name="prenom" fullWidth margin="normal" value={form.prenom as string} onChange={handleInputChange} />
              <TextField label="Téléphone" name="telephone" fullWidth margin="normal" value={form.telephone as string} onChange={handleInputChange} />
              <TextField label="CIN" name="cin" fullWidth margin="normal" value={form.cin as string} onChange={handleInputChange} />
              <TextField label="Adresse" name="adresse" fullWidth margin="normal" value={form.adresse as string} onChange={handleInputChange} />
            </Box>

            {/* ✅ Fichiers documents */}
            <Box width="100%" mt={3}>
              <h4 style={{ marginBottom: '0.5rem' }}>Documents à importer</h4>
              <Box mt={1}>
                <p style={{ marginBottom: 4 }}>Scan CIN</p>
                <TextField type="file" name="scanCIN" fullWidth margin="dense" onChange={handleInputChange} />
              </Box>
              <Box mt={1}>
                <p style={{ marginBottom: 4 }}>Scan Permis</p>
                <TextField type="file" name="scanPermis" fullWidth margin="dense" onChange={handleInputChange} />
              </Box>
              <Box mt={1}>
                <p style={{ marginBottom: 4 }}>Scan Visa</p>
                <TextField type="file" name="scanVisa" fullWidth margin="dense" onChange={handleInputChange} />
              </Box>
              <Box mt={1}>
                <p style={{ marginBottom: 4 }}>Certificat de bonne conduite</p>
                <TextField type="file" name="certificatBonneConduite" fullWidth margin="dense" onChange={handleInputChange} />
              </Box>
            </Box>

            {/* ✅ Message d'erreur */}
            {errorMsg && (
              <Box color="error.main" fontSize="0.9rem" mt={2}>
                {errorMsg}
              </Box>
            )}

            {/* ✅ Bouton de validation */}
            <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSubmit}>
              {selectedChauffeur ? 'Modifier' : 'Enregistrer'}
            </Button>
          </Box>
        </Drawer>


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg">
        <Box position="relative" p={2}>
          <IconButton
            onClick={() => {
              const filename = dialogImageSrc.split('/').pop();
              const downloadUrl = `http://localhost:5000/api/chauffeurs/download/${filename}`;
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.setAttribute('download', filename || 'document');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#fff'
            }}
          >
            <Download />
          </IconButton>

        <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        p={2}
      >
        {isPdfFile(dialogImageSrc) ? (
          <iframe
            src={dialogImageSrc}
            title="PDF Viewer"
            width="90%"
            height="700px"
            style={{ border: 'none', borderRadius: 8 }}
          ></iframe>
        ) : (
          <img
            src={dialogImageSrc}
            alt="Aperçu document"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
          />
        )}
      </Box>

        </Box>
      </Dialog>
 
      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;
