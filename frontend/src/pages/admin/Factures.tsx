import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, Select, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import Layout from '../../components/Layout';

interface Partenaire {
  _id: string;
  nom: string;
  ice?: string;
}

interface Ligne {
  date: string;
  remorque: string;
  chargement: string;
  dechargement: string;
  totalHT: number;
}

const FacturesPage: React.FC = () => {
  const [date, setDate] = useState('');
  const [tracteur, setTracteur] = useState('');
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [client, setClient] = useState('');
  const [tva, setTva] = useState(0);
  const [lignes, setLignes] = useState<Ligne[]>([]);

  const selectedClient = partenaires.find(p => p._id === client);

  useEffect(() => {
    axios.get('http://localhost:5000/api/partenaires').then(res => setPartenaires(res.data));
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  const totalHT = lignes.reduce((sum, l) => sum + (Number(l.totalHT) || 0), 0);
  const totalTVA = totalHT * (isNaN(tva) ? 0 : tva) / 100;
  const totalTTC = totalHT + totalTVA;

  const isFormValid = () => {
    return (
      client &&
      date &&
      lignes.length > 0 &&
      lignes.every(
        (l) => l.date && l.remorque && l.chargement && l.dechargement && !isNaN(l.totalHT)
      )
    );
  };

  const handleLigneChange = <K extends keyof Ligne>(
    index: number,
    field: K,
    value: string | number
  ) => {
    const updated = [...lignes];
    updated[index] = {
      ...updated[index],
      [field]: field === 'totalHT' ? parseFloat(value as string) || 0 : value
    };
    setLignes(updated);
  };

  const addLigne = () => {
    setLignes([...lignes, { date: '', remorque: '', chargement: '', dechargement: '', totalHT: 0 }]);
  };

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert("Merci de compléter tous les champs de la facture.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/factures/manual', {
        date,
        partenaire: client,
        ice: selectedClient?.ice || '',
        tracteur,
        lignes,
        tva: isNaN(tva) ? 0 : tva,
        totalHT: parseFloat(totalHT.toFixed(2)),
        totalTTC: parseFloat(totalTTC.toFixed(2))
      });

      window.open(res.data.fileUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération de la facture.");
    }
  };

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h5" fontWeight={600} mb={3}>Nouvelle Facture</Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Select fullWidth displayEmpty value={client} onChange={(e) => setClient(e.target.value)}>
            <MenuItem value="">Sélectionner client</MenuItem>
            {partenaires.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.nom}</MenuItem>
            ))}
          </Select>
          <TextField label="ICE" value={selectedClient?.ice || ''} fullWidth disabled />
          <TextField label="Tracteur" value={tracteur} onChange={e => setTracteur(e.target.value)} fullWidth />
          <TextField
            label="TVA (%)"
            type="number"
            value={isNaN(tva) ? '' : tva}
            onChange={(e) => setTva(parseFloat(e.target.value))}
            fullWidth
          />
        </Box>

        <Typography variant="h6" gutterBottom>Lignes de la facture</Typography>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Remorque</TableCell>
              <TableCell>Chargement</TableCell>
              <TableCell>Déchargement</TableCell>
              <TableCell>Total HT</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((ligne, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField
                    type="date"
                    value={ligne.date}
                    onChange={e => handleLigneChange(i, 'date', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={ligne.remorque}
                    onChange={e => handleLigneChange(i, 'remorque', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={ligne.chargement}
                    onChange={e => handleLigneChange(i, 'chargement', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={ligne.dechargement}
                    onChange={e => handleLigneChange(i, 'dechargement', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={isNaN(ligne.totalHT) ? '' : ligne.totalHT}
                    onChange={e => handleLigneChange(i, 'totalHT', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => removeLigne(i)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6}>
                <Button startIcon={<Add />} onClick={addLigne}>Ajouter ligne</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box mt={3} display="flex" gap={2}>
          <TextField label="Total HT" value={isNaN(totalHT) ? '' : totalHT.toFixed(2)} disabled />
          <TextField label="TVA" value={isNaN(totalTVA) ? '' : totalTVA.toFixed(2)} disabled />
          <TextField label="Total TTC" value={isNaN(totalTTC) ? '' : totalTTC.toFixed(2)} disabled />
        </Box>

        <Box mt={3}>
          <Button variant="contained" onClick={handleSubmit} disabled={!isFormValid()}>
            Générer et enregistrer
          </Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default FacturesPage;
