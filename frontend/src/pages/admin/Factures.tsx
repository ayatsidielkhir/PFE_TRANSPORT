import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Paper, MenuItem, Select, Table, TableHead,
  TableBody, TableRow, TableCell, Pagination, Divider, IconButton
} from '@mui/material';
import { PictureAsPdf, Delete } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/Layout';

const API = process.env.REACT_APP_API_URL;

interface Facture {
  _id: string;
  numero: string;
  client: string;
  date: string;
  totalTTC: number;
  pdfPath: string;
  payee?: boolean;
}

interface Trajet {
  _id: string;
  depart: string;
  arrivee: string;
  date: string;
  vehicule: { matricule: string };
  partenaire: { _id: string; nom: string; ice: string };
}

const FacturesPage: React.FC = () => {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [selectedTrajets, setSelectedTrajets] = useState<Trajet[]>([]);
  const [formData, setFormData] = useState({
    numeroFacture: '',
    client: '',
    ice: '',
    tracteur: '',
    date: '',
    tva: 10,
    montantsHT: [] as number[],
    remorques: [] as string[]
  });
  const [filters, setFilters] = useState({ client: '', date: '' });
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    axios.get(`${API}/trajets`).then(res => {
      const data = res.data.map((t: any) => ({
        ...t,
        partenaire: t.partenaire || { nom: '', ice: '' },
        vehicule: typeof t.vehicule === 'object' ? t.vehicule : { matricule: t.vehicule }
      }));
      setTrajets(data);
    });

    axios.get(`${API}/factures`).then(res => {
      setFactures(res.data);
      const nums = res.data.map((f: Facture) => parseInt(f.numero)).filter(Boolean);
      const next = Math.max(...nums, 0) + 1;
      setFormData(prev => ({ ...prev, numeroFacture: `${next.toString().padStart(3, '0')}/2025` }));
    });
  }, []);

  const handleMultipleTrajetSelect = (ids: string[]) => {
    const selected = trajets.filter(t => ids.includes(t._id));
    setSelectedTrajets(selected);
    if (selected.length > 0) {
      const t = selected[0];
      setFormData(prev => ({
        ...prev,
        client: t.partenaire.nom,
        ice: t.partenaire.ice,
        tracteur: t.vehicule.matricule,
        date: t.date,
        montantsHT: selected.map(() => 0),
        remorques: selected.map(() => '')
      }));
    }
  };

  const removeTrajet = (index: number) => {
    const updatedTrajets = [...selectedTrajets];
    updatedTrajets.splice(index, 1);
    const montants = [...formData.montantsHT];
    const remorques = [...formData.remorques];
    montants.splice(index, 1);
    remorques.splice(index, 1);
    setSelectedTrajets(updatedTrajets);
    setFormData(prev => ({
      ...prev,
      montantsHT: montants,
      remorques: remorques
    }));
  };

  const handleFormDataChange = (index: number, field: 'montantsHT' | 'remorques', value: string | number) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleGeneratePDF = async () => {
    try {
      const totalHT = formData.montantsHT.reduce((sum, m) => sum + m, 0);
      const tva = totalHT * (formData.tva / 100);
      const totalTTC = totalHT + tva;

      const res = await axios.post(`${API}/factures/manual`, {
        ...formData,
        totalHT,
        totalTTC,
        trajetIds: selectedTrajets.map(t => t._id),
        remorques: formData.remorques,
        montantsHT: formData.montantsHT
      });

      alert("Facture générée avec succès");
      setFactures(prev => [
        ...prev,
        {
          ...formData,
          _id: '',
          totalTTC,
          pdfPath: res.data.url,
          numero: formData.numeroFacture,
          payee: false
        }
      ]);
    } catch (err: any) {
      console.error("Erreur génération facture :", err.response?.data || err.message);
      alert("Erreur lors de la génération de la facture !");
    }
  };


  const toggleStatutPayee = async (facture: Facture) => {
    const updated = { ...facture, payee: !facture.payee };
    await axios.put(`${API}/factures/${facture._id}`, updated);
    setFactures(factures.map(f => f._id === facture._id ? updated : f));
  };

  const filtered = factures.filter(f =>
    f.client.toLowerCase().includes(filters.client.toLowerCase()) &&
    f.date.includes(filters.date)
  );
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <AdminLayout>
      <Box p={3} maxWidth="1400px" mx="auto">
        <Typography variant="h5" fontWeight="bold" color="#001447" mb={3}>Gestion des Factures</Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 5, borderRadius: 3, backgroundColor: '#f3f6f9' }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>➕ Ajouter une nouvelle facture</Typography>

          <Box display="flex" flexWrap="wrap" gap={2}>
            <Select
              fullWidth
              multiple
              value={selectedTrajets.map(t => t._id)}
              onChange={(e) => handleMultipleTrajetSelect(e.target.value as string[])}
              sx={{ flex: '1 1 100%' }}
              renderValue={(selected) =>
                trajets
                  .filter((t) => selected.includes(t._id))
                  .map((t) => `${t.depart} – ${t.arrivee}`)
                  .join(', ')
              }
            >
              {trajets.map(t => (
                <MenuItem key={t._id} value={t._id}>{`${t.depart} – ${t.arrivee} (${t.date})`}</MenuItem>
              ))}
            </Select>

            <TextField label="Facture N°" value={formData.numeroFacture} fullWidth sx={{ flex: '1 1 30%' }} InputProps={{ readOnly: true }} />
            <TextField label="Client" value={formData.client} fullWidth sx={{ flex: '1 1 30%' }} InputProps={{ readOnly: true }} />
            <TextField label="ICE" value={formData.ice} fullWidth sx={{ flex: '1 1 30%' }} InputProps={{ readOnly: true }} />
            <TextField label="Tracteur" value={formData.tracteur} fullWidth sx={{ flex: '1 1 30%' }} InputProps={{ readOnly: true }} />
            <TextField label="Date" value={formData.date} fullWidth sx={{ flex: '1 1 30%' }} InputProps={{ readOnly: true }} />
            <TextField label="TVA (%)" type="number" value={formData.tva} fullWidth sx={{ flex: '1 1 30%' }} onChange={(e) => setFormData(prev => ({ ...prev, tva: parseFloat(e.target.value) }))} />
          </Box>

          {selectedTrajets.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>Trajets sélectionnés</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Chargement</TableCell>
                    <TableCell>Déchargement</TableCell>
                    <TableCell>Remorque</TableCell>
                    <TableCell>Montant HT</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTrajets.map((t, i) => (
                    <TableRow key={t._id}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>{t.depart}</TableCell>
                      <TableCell>{t.arrivee}</TableCell>
                      <TableCell>
                        <TextField value={formData.remorques[i] || ''} onChange={(e) => handleFormDataChange(i, 'remorques', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <TextField type="number" value={formData.montantsHT[i] || ''} onChange={(e) => handleFormDataChange(i, 'montantsHT', parseFloat(e.target.value))} />
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => removeTrajet(i)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button variant="contained" onClick={handleGeneratePDF} sx={{ mt: 2, fontWeight: 'bold' }}>
                Générer PDF
              </Button>
            </Box>
          )}
        </Paper>

        <Divider sx={{ mb: 3 }} />

        <Paper elevation={3} sx={{ borderRadius: 3, p: 3, backgroundColor: 'white' }}>
          <Typography variant="h6" fontWeight="bold" color="#001447" mb={2}>📜 Historique des Factures</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                <TableCell>Facture</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total TTC</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Télécharger</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(f => (
                <TableRow key={f._id || f.numero}>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.client}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.totalTTC.toFixed(2)} DH</TableCell>
                  <TableCell>
                    <Button size="small" variant={f.payee ? 'contained' : 'outlined'} color={f.payee ? 'success' : 'warning'} onClick={() => toggleStatutPayee(f)}>
                      {f.payee ? 'Payée' : 'Impayée'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button startIcon={<PictureAsPdf />} variant="outlined" size="small" onClick={() => window.open(`${API!.replace('/api', '')}${f.pdfPath}`, '_blank')}>
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination count={Math.ceil(filtered.length / perPage)} page={page} onChange={(_, val) => setPage(val)} />
          </Box>
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default FacturesPage;
