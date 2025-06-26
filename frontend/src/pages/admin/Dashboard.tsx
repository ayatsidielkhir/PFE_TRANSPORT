import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Card, Typography, Avatar
} from '@mui/material';
import AdminLayout from '../../components/Layout';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MapIcon from '@mui/icons-material/Map';

import CaisseChart from '../../components/Charts/CaisseChart';
import ChargesPieChart from '../../components/Charts/ChargesPieChart';
import ChiffreAffaireChart from '../../components/Charts/ChiffreAffaireChart';
import NotificationsList from './NotificationsList';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    chauffeurs: 0,
    vehicules: 0,
    factures: 0,
    trajets: 0,
  });

  const [entrees, setEntrees] = useState<number[]>([]);
  const [sorties, setSorties] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [revenuNetData, setRevenuNetData] = useState<{ mois: string; revenuNet: number }[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]); // 🆕 Notifications

  useEffect(() => {
    axios.get('http://localhost:5001/api/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error('Erreur dashboard stats:', err));

    axios.get('http://localhost:5001/api/dashboard/caisse-mensuelle')
      .then(res => {
        setEntrees(res.data.entreesMensuelles);
        setSorties(res.data.sortiesMensuelles);
        setLabels(res.data.mois);
      })
      .catch(err => console.error('Erreur caisse:', err));

    axios.get('http://localhost:5001/api/dashboard/chiffre-affaire-mensuel')
      .then(res => setRevenuNetData(res.data))
      .catch(err => console.error('Erreur CA:', err));

    // 🆕 Récupération des notifications
    axios.get('http://localhost:5001/api/dashboard/notifications')
      .then(res => setNotifications(res.data.notifications))
      .catch(err => console.error('Erreur chargement notifications:', err));
  }, []);

  const statItems = [
    {
      label: 'Nombre de chauffeurs',
      value: stats.chauffeurs,
      icon: <PeopleIcon />,
      color: '#1976d2'
    },
    {
      label: 'Nombre de véhicules',
      value: stats.vehicules,
      icon: <LocalShippingIcon />,
      color: '#388e3c'
    },
    {
      label: 'Factures du jour',
      value: stats.factures,
      icon: <ReceiptIcon />,
      color: '#f57c00'
    },
    {
      label: 'Trajets du jour',
      value: stats.trajets,
      icon: <MapIcon />,
      color: '#7b1fa2'
    }
  ];

  return (
    <AdminLayout>
      <Box mt={4} px={4}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Tableau de bord
        </Typography>

        {/* 🔔 Notifications importantes */}
        {notifications.length > 0 && (
          <Box mb={4}>
            {notifications.map((note, index) => (
              <Typography key={index} color="error" fontWeight={500}>
                ⚠️ {note}
              </Typography>
            ))}
          </Box>
        )}

        {/* Stat cards */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
          {statItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: '1 1 250px',
                minWidth: 250,
              }}
            >
              <Card
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `6px solid ${item.color}`,
                  boxShadow: 3,
                }}
              >
                <Avatar sx={{ bgcolor: item.color, mr: 2 }}>
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{item.label}</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Graphs */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
          <Box flex="1 1 65%" minWidth={300}>
            <ChiffreAffaireChart data={revenuNetData} />
          </Box>
          <Box flex="1 1 30%" minWidth={300}>
            <ChargesPieChart />
          </Box>
        </Box>

        {/* Caisse */}
        <Box mb={4}>
          <CaisseChart entrees={entrees} sorties={sorties} labels={labels} />
        </Box>

        {/* 🔔 Notifications générales */}
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            🔔 Notifications du jour
          </Typography>
          <NotificationsList />
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
