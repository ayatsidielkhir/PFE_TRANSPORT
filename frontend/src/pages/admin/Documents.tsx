import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, FormControl,
  InputLabel, Drawer, TextField
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import AdminLayout from '../../components/Layout';
import { SelectChangeEvent } from '@mui/material';

interface DocumentData {
  _id: string;
  type: string;
  fileName: string;
  filePath: string;
  statut: string;
  expirationDate: string;
  entityType: 'chauffeur' | 'vehicule';
  linkedTo: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [vehicules, setVehicules] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<DocumentData | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<'chauffeur' | 'vehicule' | null>(null);
  const [selectedLinkedTo, setSelectedLinkedTo] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [statut, setStatut] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
    }
  };

  const fetchChauffeurs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chauffeurs');
      setChauffeurs(res.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des chauffeurs:', error);
    }
  };

  const fetchVehicules = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vehicules');
      setVehicules(res.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchChauffeurs();
    fetchVehicules();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setSelectedEntityType(null);
    setSelectedLinkedTo('');
    setExpirationDate('');
    setStatut('');
    setFile(null);
    setDrawerOpen(true);
  };

  const handleEdit = (doc: DocumentData) => {
    setEditData(doc);
    setSelectedEntityType(doc.entityType);
    setSelectedLinkedTo(doc.linkedTo);
    setExpirationDate(doc.expirationDate.split('T')[0]); // Format pour input date
    setStatut(doc.statut);
    setFile(null); // On ne modifie pas le fichier à ce stade
    setDrawerOpen(true);
  };

  const handleEntityTypeChange = (e: SelectChangeEvent) => {
    const newEntityType = e.target.value as 'chauffeur' | 'vehicule';
    setSelectedEntityType(newEntityType);
    setSelectedLinkedTo('');
  };

  const handleLinkedToChange = (e: SelectChangeEvent) => {
    setSelectedLinkedTo(e.target.value);
  };

  const handleSaveDocument = async () => {
    if (!selectedEntityType || !selectedLinkedTo || !expirationDate || !statut || (!file && !editData)) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append('type', 'visa'); // à adapter selon logique de ton projet
    formData.append('expirationDate', expirationDate);
    formData.append('entityType', selectedEntityType);
    formData.append('linkedTo', selectedLinkedTo);
    formData.append('statut', statut);

    if (file) {
      formData.append('fichier', file);
    }

    try {
      if (editData) {
        await axios.put(`http://localhost:5000/api/documents/${editData._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:5000/api/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setDrawerOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      fetchDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
    }
  };

  return (
    <AdminLayout>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight={600}>Documents</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Ajouter</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                <TableCell>Type</TableCell>
                <TableCell>Chauffeur/Véhicule</TableCell>
                <TableCell>Fichier</TableCell>
                <TableCell>Date d'expiration</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>
                    {(doc.linkedTo as any)?.nom || 'Non trouvé'}
                  </TableCell>
                 <TableCell>
                            <a
                          href={`http://localhost:5000/${doc.filePath.replace(/\\/g, '/').replace(/^\/+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir
                        </a>

                  </TableCell>
                  <TableCell>{new Date(doc.expirationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.statut}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(doc)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(doc._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>
              {editData ? 'Modifier Document' : 'Ajouter Document'}
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Type d'entité</InputLabel>
              <Select
                value={selectedEntityType || ''}
                onChange={handleEntityTypeChange}
              >
                <MenuItem value="chauffeur">Chauffeur</MenuItem>
                <MenuItem value="vehicule">Véhicule</MenuItem>
              </Select>
            </FormControl>

            {selectedEntityType === 'chauffeur' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Chauffeur</InputLabel>
                <Select
                  value={selectedLinkedTo}
                  onChange={handleLinkedToChange}
                >
                  {chauffeurs.map((chauffeur) => (
                    <MenuItem key={chauffeur._id} value={chauffeur._id}>
                      {chauffeur.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedEntityType === 'vehicule' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Véhicule</InputLabel>
                <Select
                  value={selectedLinkedTo}
                  onChange={handleLinkedToChange}
                >
                  {vehicules.map((vehicule) => (
                    <MenuItem key={vehicule._id} value={vehicule._id}>
                      {vehicule.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Upload fichier */}
            <Box marginY={2}>
              <Typography variant="subtitle2" mb={1}>Fichier</Typography>
              <input
                type="file"
                accept="*/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Box>

            <TextField
              label="Date d'expiration"
              type="date"
              fullWidth
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Statut"
              fullWidth
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              margin="normal"
            />

            <Button variant="contained" color="primary" onClick={handleSaveDocument} fullWidth sx={{ mt: 2 }}>
              {editData ? 'Modifier' : 'Ajouter'}
            </Button>
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default DocumentsPage;
