// ✅ Page Charges.tsx complète avec statistiques intégrées

import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Drawer, Typography, MenuItem, Select,
  FormControl, InputLabel, Chip
} from '@mui/material';
import { Add, Edit, Delete, PictureAsPdf, GridOn } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import axios from '../../utils/axios';
import AdminLayout from '../../components/Layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Charge {
  _id?: string;
  type: string;
  montant: number;
  date: string;
  statut: 'Payé' | 'Non payé';
  autreType?: string;
}

interface Chauffeur {
  _id: string;
  nom: string;
  prenom: string;
}

const ChargesPage: React.FC = () => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chauffeurSelectionne, setChauffeurSelectionne] = useState<Chauffeur | null>(null);
  const [form, setForm] = useState<Charge>({ type: '', montant: 0, date: '', statut: 'Non payé' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    fetchCharges();
    fetchChauffeurs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [charges, filterType, filterStatut, filterDateFrom, filterDateTo]);

  const fetchCharges = async () => {
    const res = await axios.get('/api/charges');
    setCharges(res.data);
  };

  const fetchChauffeurs = async () => {
    const res = await axios.get('/api/chauffeurs');
    setChauffeurs(res.data);
  };

  const applyFilters = () => {
    let filtered = [...charges];
    if (filterType) filtered = filtered.filter(c => c.type === filterType);
    if (filterStatut) filtered = filtered.filter(c => c.statut === filterStatut);
    if (filterDateFrom) filtered = filtered.filter(c => new Date(c.date) >= new Date(filterDateFrom));
    if (filterDateTo) filtered = filtered.filter(c => new Date(c.date) <= new Date(filterDateTo));
    setFilteredCharges(filtered);
  };

  const handleChange = (field: keyof Charge, value: any) => {
    setForm({ ...form, [field]: value });
    if (field === 'type' && !['Salaire', 'CNSS'].includes(value)) {
      setChauffeurSelectionne(null);
    }
  };

  const handleAdd = () => {
    setForm({ type: '', montant: 0, date: '', statut: 'Non payé' });
    setChauffeurSelectionne(null);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const handleEdit = (charge: Charge) => {
    setForm(charge);
    setChauffeurSelectionne(null);
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const finalForm = {
      ...form,
      type: form.type === 'Autre' ? form.autreType || 'Autre' : form.type,
    };

    try {
      const res = isEditing && form._id
        ? await axios.put(`/api/charges/${form._id}`, finalForm)
        : await axios.post('/api/charges', finalForm);
      if ([200, 201].includes(res.status)) {
        fetchCharges();
        setDrawerOpen(false);
      }
    } catch {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm("Supprimer cette charge ?")) {
      await axios.delete(`/api/charges/${id}`);
      fetchCharges();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Charges", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['Type', 'Montant (MAD)', 'Date', 'Statut']],
      body: filteredCharges.map(c => [
        c.type,
        c.montant.toFixed(2),
        new Date(c.date).toLocaleDateString(),
        c.statut,
      ]),
    });
    const total = filteredCharges.reduce((sum, c) => sum + c.montant, 0);
    if ((doc as any).lastAutoTable?.finalY) {
      doc.text(`Total : ${total.toFixed(2)} MAD`, 14, (doc as any).lastAutoTable.finalY + 10);
    }
    doc.save('charges.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredCharges.map(c => ({
      Type: c.type,
      Montant: c.montant,
      Date: new Date(c.date).toLocaleDateString(),
      Statut: c.statut
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
    XLSX.writeFile(wb, 'charges.xlsx');
  };

  return (
    <AdminLayout>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">Gestion des Charges</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', backgroundColor: '#001e61', '&:hover': { backgroundColor: '#00184a' } }}
            onClick={handleAdd}
          >
            Ajouter Charge
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          {[
            {
              label: 'Total Charges',
              value: filteredCharges.reduce((sum, c) => sum + c.montant, 0).toFixed(2) + ' MAD',
              color: '#001e61'
            },
            {
              label: 'Payées',
              value: filteredCharges.filter(c => c.statut === 'Payé').reduce((sum, c) => sum + c.montant, 0).toFixed(2) + ' MAD',
              color: '#388e3c'
            },
            {
              label: 'Non Payées',
              value: filteredCharges.filter(c => c.statut === 'Non payé').reduce((sum, c) => sum + c.montant, 0).toFixed(2) + ' MAD',
              color: '#d32f2f'
            }
          ].map((stat, idx) => (
            <Paper
              key={idx}
              elevation={3}
              sx={{
                flex: '1 1 200px',
                p: 2,
                borderLeft: `6px solid ${stat.color}`,
                borderRadius: 2,
                backgroundColor: '#fefefe'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">{stat.label}</Typography>
              <Typography variant="h6" fontWeight="bold">{stat.value}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default ChargesPage;