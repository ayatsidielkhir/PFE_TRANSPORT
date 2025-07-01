  import React, { useEffect, useState } from 'react';
  import {
    Box, Typography, Paper, Chip, Button, Select, MenuItem,
    InputLabel, FormControl
  } from '@mui/material';
  import { styled } from '@mui/system';
  import PeopleIcon from '@mui/icons-material/People';
  import LocalShippingIcon from '@mui/icons-material/LocalShipping';
  import ReceiptIcon from '@mui/icons-material/Receipt';
  import MapIcon from '@mui/icons-material/Map';
  import AdminLayout from '../../components/Layout';
  import ChiffreAffaireChart from '../../components/charts/ChiffreAffaireChart';
  import ChargesPieChart from '../../components/charts/ChargesPieChart';
  import CaisseChart from '../../components/charts/CaisseChart';
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';

  const API = process.env.REACT_APP_API_URL;

  const ResponsiveRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  }));

  const ResponsiveItem = styled('div')(({ theme }) => ({
    flex: '1 1 calc(25% - 16px)',
    minWidth: '250px',
  }));

  const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState({ chauffeurs: 0, vehicules: 0, factures: 0, trajets: 0 });
    const [notifications, setNotifications] = useState<{ type: string, message: string, date?: string }[]>([]);
    const [chiffreAffaire, setChiffreAffaire] = useState<any[]>([]);
    const [caisseData, setCaisseData] = useState<{ entrees: number[], sorties: number[], labels: string[] }>({
      entrees: [],
      sorties: [],
      labels: []
    });
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const months = ['all', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
      const fetchData = async () => {
      const [statsRes, notifRes, chiffreRes, caisseRes] = await Promise.all([
        axios.get(`${API}/dashboard/admin/dashboard`), // ✔️ corrigé ici
        axios.get(`${API}/dashboard/notifications`),
        axios.get(`${API}/dashboard/chiffre-affaire-mensuel`),
        axios.get(`${API}/dashboard/caisse-mensuelle`)
      ]);


        const parsedNotifs = notifRes.data.notifications.map((n: string) => {
          const [type, date, message] = n.split('::');
          return { type, date, message };
        });

        setStats(statsRes.data);
        setNotifications(parsedNotifs);
        setChiffreAffaire(chiffreRes.data);
        setCaisseData({
          entrees: caisseRes.data.entreesMensuelles,
          sorties: caisseRes.data.sortiesMensuelles,
          labels: caisseRes.data.mois
        });
      };

      fetchData();
    }, []);

    const handleExportExcel = () => {
      const ws = XLSX.utils.json_to_sheet([
        { ...stats, Mois: selectedMonth !== 'all' ? selectedMonth : 'Tous les mois' }
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
      XLSX.writeFile(wb, 'dashboard_export.xlsx');
    };

    const handleExportPDF = () => {
      const doc = new jsPDF();
      doc.text('Résumé du Dashboard', 14, 16);
      autoTable(doc, {
        startY: 22,
        head: [['Chauffeurs', 'Véhicules', 'Factures', 'Trajets', 'Mois']],
        body: [[stats.chauffeurs, stats.vehicules, stats.factures, stats.trajets, selectedMonth !== 'all' ? selectedMonth : 'Tous']],
      });
      doc.save('dashboard_export.pdf');
    };

    return (
      <AdminLayout>
        <Box p={3}>

          <ResponsiveRow>
            {[{ label: 'Nombre de chauffeurs', value: stats.chauffeurs, icon: <PeopleIcon />, color: '#1976d2' },
              { label: 'Nombre de véhicules', value: stats.vehicules, icon: <LocalShippingIcon />, color: '#4caf50' },
              { label: 'Factures du jour', value: stats.factures, icon: <ReceiptIcon />, color: '#ff9800' },
              { label: 'Trajets du jour', value: stats.trajets, icon: <MapIcon />, color: '#7b1fa2' }
            ].map((item, i) => (
              <ResponsiveItem key={i}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: `6px solid ${item.color}`, borderRadius: 3 }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 32, color: item.color } })}
                  <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                  <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
                </Paper>
              </ResponsiveItem>
            ))}
          </ResponsiveRow>

          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Box flex={1} minWidth={300}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <ChiffreAffaireChart data={chiffreAffaire} />
              </Paper>
            </Box>
            <Box flex={1} minWidth={300} maxWidth={400}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <ChargesPieChart />
              </Paper>
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box flex={1} minWidth={300}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>🔔 Notifications du jour</Typography>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                {notifications.map((notif, idx) => (
                  <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                    <Box>
                      <Typography variant="body2">{notif.message}</Typography>
                      {notif.date && <Typography variant="caption" color="text.secondary">{notif.date}</Typography>}
                    </Box>
                    <Chip
                      label={notif.type}
                      sx={{
                        bgcolor: notif.type === 'TRAJET' ? '#1976d2' : notif.type === 'CAISSE' ? '#4caf50' : notif.type === 'CHARGE' ? '#e53935' : '#9e9e9e',
                        color: '#fff',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                ))}
              </Paper>
            </Box>
            <Box flex={1} minWidth={300}>
              <Paper sx={{ p: 2, borderRadius: 3 }}>
                <CaisseChart
                  entrees={caisseData.entrees}
                  sorties={caisseData.sorties}
                  labels={caisseData.labels}
                />
              </Paper>
            </Box>
          </Box>
        </Box>
      </AdminLayout>
    );
  };

  export default DashboardPage;