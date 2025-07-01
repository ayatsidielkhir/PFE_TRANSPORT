import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Chip, Button
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MapIcon from '@mui/icons-material/Map';
import AdminLayout from '../../components/Layout';
import ChiffreAffaireChart from '../../components/charts/ChiffreAffaireChart';
import ChargesPieChart from '../../components/charts/ChargesPieChart';
import CaisseChart from '../../components/charts/CaisseChart';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ chauffeurs: 0, vehicules: 0, factures: 0, trajets: 0 });
  const [notifications, setNotifications] = useState<{ type: string, message: string, date?: string }[]>([]);
  const [chiffreAffaire, setChiffreAffaire] = useState<
    { mois: string; revenu: number; depenses: number; revenuNet: number }[]
  >([]);
  const [caisseData, setCaisseData] = useState<{ entrees: number[], sorties: number[], labels: string[] }>({
    entrees: [],
    sorties: [],
    labels: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes, chiffreRes, caisseRes] = await Promise.all([
          axios.get(`${API}/admin/dashboard`),
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
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout>
      <Box p={3}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          MME – Système de Management du Transport
        </Typography>

        {/* Statistiques */}
        <Box display="flex" gap={2} mb={4} flexWrap="wrap">
          {[
            { label: 'Nombre de chauffeurs', value: stats.chauffeurs, icon: <PeopleIcon />, color: '#1976d2' },
            { label: 'Nombre de véhicules', value: stats.vehicules, icon: <LocalShippingIcon />, color: '#388e3c' },
            { label: 'Factures du jour', value: stats.factures, icon: <ReceiptIcon />, color: '#f57c00' },
            { label: 'Trajets du jour', value: stats.trajets, icon: <MapIcon />, color: '#7b1fa2' }
          ].map((item, i) => (
            <Paper key={i} elevation={3} sx={{
              p: 2,
              width: 230,
              height: 120,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderLeft: `6px solid ${item.color}`
            }}>
              <Box>{React.cloneElement(item.icon, { sx: { fontSize: 32, color: item.color } })}</Box>
              <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
              <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Graphiques */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Box flex="1 1 60%" minWidth={350}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Chiffre d'affaires (Revenus – Dépenses)
              </Typography>
              <ChiffreAffaireChart data={chiffreAffaire} />
            </Paper>
          </Box>
          <Box flex="1 1 35%" minWidth={300}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <ChargesPieChart />
            </Paper>
          </Box>
        </Box>

        <Box mb={3}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <CaisseChart
              entrees={caisseData.entrees}
              sorties={caisseData.sorties}
              labels={caisseData.labels}
            />
          </Paper>
        </Box>

        {/* Notifications */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            🔔 Notifications du jour
          </Typography>
          <Button variant="contained" size="small" sx={{ bgcolor: '#001e61', textTransform: 'none' }}>TOUT VOIR</Button>
        </Box>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          {notifications.map((notif, idx) => (
            <Box
              key={idx}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              py={1}
              sx={{ borderBottom: idx < notifications.length - 1 ? '1px solid #eee' : 'none' }}
            >
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                {notif.date && <Typography variant="caption" color="text.secondary">{notif.date}</Typography>}
              </Box>
              <Chip
                label={notif.type}
                sx={{
                  bgcolor: notif.type === 'TRAJET' ? '#1976d2'
                    : notif.type === 'CAISSE' ? '#4caf50'
                    : notif.type === 'CHARGE' ? '#e53935'
                    : '#9e9e9e',
                  color: '#fff',
                  fontWeight: 600
                }}
              />
            </Box>
          ))}
        </Paper>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
