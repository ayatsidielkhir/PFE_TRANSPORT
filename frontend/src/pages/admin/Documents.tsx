import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Drawer, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';
import UploadDocumentForm from '../../components/UploadDocumentForm';

interface DocumentData {
  _id: string;
  type: string;
  fichier: string;
  nom: string;
  statut: string;
  date_expiration: string;
  entityType: 'chauffeur' | 'vehicule';
  linkedTo: string;
  expirationDate: string;
}


const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState<DocumentData | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/documents');
      setDocuments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleEdit = (doc: DocumentData) => {
    setEditData(doc);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setDrawerOpen(true);
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
                <TableCell>Chauffeur / Véhicule</TableCell>
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
                  <TableCell>{doc.nom}</TableCell>
                  <TableCell>
                    <a href={doc.fichier} target="_blank" rel="noopener noreferrer">Voir</a>
                  </TableCell>
                  <TableCell>{new Date(doc.date_expiration).toLocaleDateString()}</TableCell>
                  <TableCell>{doc.statut}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(doc)}><Edit /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box p={3} width={400}>
            <Typography variant="h6" mb={2}>
              {editData ? 'Modifier Document' : 'Ajouter Document'}
            </Typography>
            <UploadDocumentForm
              editData={editData}
              onUploadSuccess={() => {
                setDrawerOpen(false);
                fetchDocuments();
              }}
            />
          </Box>
        </Drawer>
      </Box>
    </AdminLayout>
  );
};

export default DocumentsPage;
