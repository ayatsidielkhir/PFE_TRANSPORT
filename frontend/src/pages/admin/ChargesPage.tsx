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
    import { useMediaQuery } from '@mui/material';
    import { Pagination } from '@mui/material';

    const API = process.env.REACT_APP_API_URL;

    interface Charge {
      _id?: string;
      type: string;
      montant: number;
      date: string;
      statut: 'Payé' | 'Non payé';
      autreType?: string;
      chauffeur?: Chauffeur;
      vehicule?: Vehicule;

    }
    interface Vehicule {
    _id: string;
    nom: string;
    matricule: string;
  }


    interface Chauffeur {
      _id: string;
      nom: string;
      prenom: string;
    }

    const ChargesPage: React.FC = () => {
      const [vehicules, setVehicules] = useState<Vehicule[]>([]);
      const [vehiculeSelectionne, setVehiculeSelectionne] = useState<Vehicule | null>(null);
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
        fetchVehicules();

      }, []);
      const fetchVehicules = async () => {
      const res = await axios.get(`${API}/vehicules`);
      setVehicules(res.data);
    };


      useEffect(() => {
        applyFilters();
      }, [charges, filterType, filterStatut, filterDateFrom, filterDateTo]);

      const fetchCharges = async () => {
        const res = await axios.get(`${API}/charges`);
        setCharges(res.data);
      };

      const fetchChauffeurs = async () => {
        const res = await axios.get(`${API}/chauffeurs`);
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
        if (field === 'type' && !['Carburant', 'Entretien', 'Vignette'].includes(value)) {
        setVehiculeSelectionne(null);
  }
      };

      const handleAdd = () => {
        setForm({ type: '', montant: 0, date: '', statut: 'Non payé', autreType:'' });
        setChauffeurSelectionne(null);
        setIsEditing(false);
        setDrawerOpen(true);
      };

      const handleEdit = (charge: Charge) => {
        setForm(charge);
        setChauffeurSelectionne(charge.chauffeur || null);
        setVehiculeSelectionne(charge.vehicule || null);
        setIsEditing(true);
        setDrawerOpen(true);
      };

      const handleSave = async () => {
        if (form.type === 'Autre' && (form.autreType?.trim() === '')) {
          alert("Veuillez spécifier un nom pour le type 'Autre'.");
          return;
        }

        const { autreType, ...rest } = form;

        // 🔧 Ajout dynamique du champ chauffeur ou vehicule
        const finalForm = {
          ...rest,
          type: form.type === 'Autre' && autreType ? autreType : form.type,
          chauffeur: chauffeurSelectionne?._id || undefined,
          vehicule: vehiculeSelectionne?._id || undefined
        };

        try {
          const res = isEditing && form._id
            ? await axios.put(`${API}/charges/${form._id}`, finalForm)
            : await axios.post(`${API}/charges`, finalForm);

          if ([200, 201].includes(res.status)) {
            fetchCharges();
            setDrawerOpen(false);
          }
        } catch (err) {
          console.error("Erreur enregistrement :", err);
          alert("Erreur lors de l'enregistrement.");
        }
      };


      const handleDelete = async (id?: string) => {
        if (!id) return;
        if (window.confirm("Supprimer cette charge ?")) {
          await axios.delete(`${API}/charges/${id}`);
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

      const isMobile = useMediaQuery('(max-width:600px)');
      const [page, setPage] = useState(1);
      const perPage = 5;

      const paginatedCharges = filteredCharges.slice((page - 1) * perPage, page * perPage);


      return (
      <AdminLayout>
        <Box p={3}>
          {/* ✅ Statistiques */}
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

          {/* ✅ Filtres + Bouton */}
          <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: '#e3f2fd',
            borderRadius: 2
          }}
        >
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems={isMobile ? 'stretch' : 'center'}
            gap={isMobile ? 2 : 1}
          >
            {/* 🔍 Filtres groupés */}
            <Box display="flex" flexWrap="wrap" gap={2} width={isMobile ? '100%' : '75%'}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={e => setFilterType(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel sx={{ backgroundColor: 'white', px: 0.5 }}>Statut</InputLabel>
                <Select
                  value={filterStatut}
                  label="Statut"
                  onChange={e => setFilterStatut(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Payé">Payé</MenuItem>
                  <MenuItem value="Non payé">Non payé</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="month"
                label="Mois"
                size="small"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 160,
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Button
                onClick={() => {
                  setFilterType('');
                  setFilterStatut('');
                  setFilterDateFrom('');
                }}
                size="small"
                color="inherit"
                sx={{ height: 40, fontWeight: 'bold' }}
              >
                Réinitialiser
              </Button>
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
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
              Ajouter Charge
            </Button>
          </Box>
        </Paper>



          {/* ✅ Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead  sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', color: '#001e61' }}>
                  <TableRow>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Montant</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell> {/* ✅ déplacer ici */}
                    <TableCell><strong>Chauffeur / Véhicule</strong></TableCell> {/* ✅ ensuite */}
                    <TableCell><strong>Statut</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
              {paginatedCharges.map((c: Charge, i: number) => (
                  <TableRow key={c._id} sx={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fbfd', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>{c.montant.toFixed(2)} MAD</TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString('fr-FR')}</TableCell>
                   <TableCell>
                      {c.vehicule
                        ? `${c.vehicule.nom} - ${c.vehicule.matricule}`
                        : c.chauffeur
                        ? `${c.chauffeur.nom} ${c.chauffeur.prenom}`
                        : '--'}
                    </TableCell>



                    <TableCell>
                      <Chip
                        label={c.statut}
                        sx={{
                          backgroundColor: c.statut === 'Payé' ? '#c8e6c9' : '#ffcdd2',
                          color: c.statut === 'Payé' ? 'green' : 'red',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(c)} sx={{ color: '#1976d2' }}><Edit /></IconButton>
                      <IconButton onClick={() => handleDelete(c._id)} sx={{ color: '#d32f2f' }}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ✅ Pagination + Export */}
            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
                {/* Pagination centrée */}
                <Box flex={1} display="flex" justifyContent="center">
                  <Pagination
                    count={Math.ceil(filteredCharges.length / perPage)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
            <Box display="flex" gap={1}>
              <Button variant="contained" startIcon={<PictureAsPdf />} onClick={exportPDF} sx={{ backgroundColor: '#d32f2f', borderRadius: 3 }}>PDF</Button>
              <Button variant="contained" startIcon={<GridOn />} onClick={exportExcel} sx={{ backgroundColor: '#388e3c', borderRadius: 3 }}>Excel</Button>
            </Box>
          </Box>

            {/* ✅ Drawer Formulaire */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box p={3}  mt={10} width={400}>
                <Typography variant="h6" mb={2}>{isEditing ? 'Modifier' : 'Ajouter'} une Charge</Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select value={form.type} onChange={e => handleChange('type', e.target.value)} label="Type">
                    {['Salaire', 'CNSS', 'Entretien', 'Carburant', 'Vignette', 'Autre'].map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {form.type === 'Autre' && (
                  <TextField label="Nom personnalisé" fullWidth margin="normal" value={form.autreType || ''} onChange={e => setForm({ ...form, autreType: e.target.value })} />
                )}

                {['Salaire', 'CNSS'].includes(form.type) && (
                  <Autocomplete
                    options={chauffeurs}
                    getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                    value={chauffeurSelectionne}
                    onChange={(_, newValue) => setChauffeurSelectionne(newValue)}
                    renderInput={(params) => <TextField {...params} label="Chauffeur" margin="normal" />}
                  />
                )}
                {['Carburant', 'Entretien', 'Vignette'].includes(form.type) && (
                  <Autocomplete
                    options={vehicules}
                    getOptionLabel={(option) => `${option.nom} - ${option.matricule}`}
                    value={vehiculeSelectionne}
                    onChange={(_, newValue) => setVehiculeSelectionne(newValue)}
                    renderInput={(params) => <TextField {...params} label="Véhicule" margin="normal" />}
                  />

                )}



                <TextField label="Montant (MAD)" type="number" fullWidth margin="normal" value={form.montant} onChange={e => handleChange('montant', parseFloat(e.target.value))} />
                <TextField type="date" label="Date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={form.date} onChange={e => handleChange('date', e.target.value)} />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Statut</InputLabel>
                  <Select value={form.statut} onChange={e => handleChange('statut', e.target.value)} label="Statut">
                    <MenuItem value="Payé">Payé</MenuItem>
                    <MenuItem value="Non payé">Non payé</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={form.type === 'Autre' && (!form.autreType || form.autreType.trim() === '')}
                  sx={{ mt: 2, borderRadius: 3 }}
                  onClick={handleSave}
                >
                  Enregistrer
                </Button>
              </Box>
            </Drawer>
          </Box>
        </AdminLayout>
      );
    };

    export default ChargesPage;
