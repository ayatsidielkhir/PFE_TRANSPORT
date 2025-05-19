import React, { useEffect, useState } from 'react';
import {
  Box, Button, Drawer, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
  telephone: string;
  cin: string;
  adresse?: string;
  observations?: string;
  photo?: string;
  scanCIN?: string;
  certificatBonneConduite?: string;
}

const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [filteredChauffeurs, setFilteredChauffeurs] = useState<Chauffeur[]>([]);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState<Record<string, string | Blob | null>>({
    nom: '',
    prenom: '',
    telephone: '',
    cin: '',
    adresse: '',
    observations: '',
    photo: null,
    scanCIN: null,
    certificatBonneConduite: null
  });
  const [page, setPage] = useState(1);
  const perPage = 5;

  const fetchChauffeurs = async () => {
    const res = await axios.get('http://localhost:5000/api/chauffeurs');
    setChauffeurs(res.data);
    setFilteredChauffeurs(res.data);
  };

  useEffect(() => {
    fetchChauffeurs();
  }, []);

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
      const res = await axios.post('http://localhost:5000/api/chauffeurs', formData);
      if (res.status === 200 || res.status === 201) {
        setDrawerOpen(false);
        setForm({
          nom: '',
          prenom: '',
          telephone: '',
          cin: '',
          adresse: '',
          observations: '',
          photo: null,
          scanCIN: null,
          certificatBonneConduite: null
        });
        fetchChauffeurs();
        setErrorMsg('');
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        setErrorMsg(err.response.data.message || 'Erreur de validation');
      } else {
        setErrorMsg("Erreur lors de l'ajout du chauffeur");
      }
    }
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/chauffeurs/${id}`);
    fetchChauffeurs();
  };

  const paginatedChauffeurs = filteredChauffeurs.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <h2>Chauffeurs</h2>
          <Button variant="contained" onClick={() => {
            setDrawerOpen(true);
            setErrorMsg('');
          }}>Ajouter</Button>
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
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>CIN</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedChauffeurs.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.nom}</TableCell>
                <TableCell>{c.prenom}</TableCell>
                <TableCell>{c.telephone}</TableCell>
                <TableCell>{c.cin}</TableCell>
                <TableCell>{c.adresse}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(c._id)}>
                    <Delete />
                  </IconButton>
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
            <h3>Ajouter Chauffeur</h3>
            <TextField label="Nom" name="nom" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField label="Prénom" name="prenom" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField label="Téléphone" name="telephone" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField label="CIN" name="cin" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField label="Adresse" name="adresse" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField label="Observations" name="observations" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="photo" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="scanCIN" fullWidth margin="normal" onChange={handleInputChange} />
            <TextField type="file" name="certificatBonneConduite" fullWidth margin="normal" onChange={handleInputChange} />

            {errorMsg && (
              <Box color="error.main" fontSize="0.9rem" mt={1}>
                {errorMsg}
              </Box>
            )}

            <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
              Enregistrer
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default ChauffeursPage;