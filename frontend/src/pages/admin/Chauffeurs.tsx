// ✅ Chauffeurs.tsx
// (frontend React page avec ajout/modif des documents, photo et édition complète)

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, Avatar, Tooltip
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import { Dialog } from '@mui/material';
import { Download } from '@mui/icons-material';


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
  const [form, setForm] = useState<Record<string, string | Blob | null>>({
    nom: '', prenom: '', telephone: '', cin: '', adresse: '',
    photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
  });

const [openDialog, setOpenDialog] = useState(false);
const [dialogImageSrc, setDialogImageSrc] = useState('');

  const [page, setPage] = useState(1);
  const perPage = 5;

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
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
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
        setDrawerOpen(false);
        resetForm();
        fetchChauffeurs();
        setErrorMsg('');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l\'enregistrement du chauffeur');
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
      photo: null,
      scanCIN: null,
      scanPermis: null,
      scanVisa: null,
      certificatBonneConduite: null
    });
    setDrawerOpen(true);
    setErrorMsg('');
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/chauffeurs/${id}`);
    fetchChauffeurs();
  };

  const resetForm = () => {
    setForm({
      nom: '', prenom: '', telephone: '', cin: '', adresse: '',
      photo: null, scanCIN: null, scanPermis: null, scanVisa: null, certificatBonneConduite: null
    });
    setSelectedChauffeur(null);
  };

  const paginatedChauffeurs = filteredChauffeurs.slice((page - 1) * perPage, page * perPage);


  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <h2>Chauffeurs</h2>
          <Button variant="contained" onClick={() => { setDrawerOpen(true); resetForm(); }}>Ajouter</Button>
        </Box>

        <TextField
          label="Recherche par nom ou prénom"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>CIN</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>CIScan</TableCell>
              <TableCell>PScan</TableCell>
              <TableCell>VScan</TableCell>
              <TableCell>CScan</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedChauffeurs.map((c) => (
              <TableRow key={c._id}>
                <TableCell>

                    {c.photo ? (
                      <Avatar
                        src={`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`}
                        sx={{ width: 40, height: 40, cursor: 'pointer' }}
                        onClick={() => {
                          setDialogImageSrc(`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`);
                          setOpenDialog(true);
                        }}
                      />
                    ) : 'N/A'}
                
                </TableCell>
                <TableCell>{c.nom}</TableCell>
                <TableCell>{c.prenom}</TableCell>
                <TableCell>{c.telephone}</TableCell>
                <TableCell>{c.cin}</TableCell>
                <TableCell>{c.adresse}</TableCell>
                  <TableCell>
                    {c.scanCIN ? (
                      <Avatar
                        src={`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`}
                        sx={{ width: 40, height: 40, cursor: 'pointer' }}
                        onClick={() => {
                          setDialogImageSrc(`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`);
                          setOpenDialog(true);
                        }}
                      />
                    ) : 'N/A'}
                  </TableCell>
                <TableCell>
                    {c.scanPermis ? (
                      <Avatar
                        src={`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`}
                        sx={{ width: 40, height: 40, cursor: 'pointer' }}
                        onClick={() => {
                          setDialogImageSrc(`http://localhost:5000/uploads/chauffeurs/${c.scanPermis}`);
                          setOpenDialog(true);
                        }}
                      />
                    ) : 'N/A'}
                  </TableCell>
             <TableCell>
              {c.scanVisa ? (
                <Avatar
                  src={`http://localhost:5000/uploads/chauffeurs/${c.scanVisa}`}
                  sx={{ width: 40, height: 40, cursor: 'pointer' }}
                  onClick={() => {
                    setDialogImageSrc(`http://localhost:5000/uploads/chauffeurs/${c.scanVisa}`);
                    setOpenDialog(true);
                  }}
                />
              ) : 'N/A'}
            </TableCell>

             <TableCell>
                {c.certificatBonneConduite ? (
                  <Avatar
                    src={`http://localhost:5000/uploads/chauffeurs/${c.certificatBonneConduite}`}
                    sx={{ width: 40, height: 40, cursor: 'pointer' }}
                    onClick={() => {
                      setDialogImageSrc(`http://localhost:5000/uploads/chauffeurs/${c.certificatBonneConduite}`);
                      setOpenDialog(true);
                    }}
                  />
                ) : 'N/A'}
              </TableCell>

                <TableCell>
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => handleEdit(c)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => handleDelete(c._id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
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
          <Box p={3} width={350}>
            <h3>{selectedChauffeur ? 'Modifier Chauffeur' : 'Ajouter Chauffeur'}</h3>
            <TextField label="Nom" name="nom" fullWidth margin="normal" value={form.nom as string} onChange={handleInputChange} />
            <TextField label="Prénom" name="prenom" fullWidth margin="normal" value={form.prenom as string} onChange={handleInputChange} />
            <TextField label="Téléphone" name="telephone" fullWidth margin="normal" value={form.telephone as string} onChange={handleInputChange} />
            <TextField label="CIN" name="cin" fullWidth margin="normal" value={form.cin as string} onChange={handleInputChange} />
            <TextField label="Adresse" name="adresse" fullWidth margin="normal" value={form.adresse as string} onChange={handleInputChange} />
            <TextField type="file" name="photo" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="scanCIN" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="scanPermis" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="scanVisa" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="certificatBonneConduite" fullWidth margin="normal" onChange={handleInputChange} />

            {errorMsg && (
              <Box color="error.main" fontSize="0.9rem" mt={1}>
                {errorMsg}
              </Box>
            )}

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
              {selectedChauffeur ? 'Modifier' : 'Enregistrer'}
            </Button>
          </Box>
        </Drawer>
      </Box>


    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
  <Box position="relative" p={2}>
    {/* Icône de téléchargement en haut à droite */}
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

      sx={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#fff' }}
    >
      <Download />
    </IconButton>

    {/* Image affichée */}
    <Box display="flex" justifyContent="center">
      <img
        src={dialogImageSrc}
        alt="Aperçu"
        style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8 }}
      />
    </Box>
  </Box>
</Dialog>

    </AdminLayout>
  
  );
};

export default ChauffeursPage;
