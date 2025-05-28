import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  Avatar
} from '@mui/material';
import AdminLayout from '../../components/Layout';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MapIcon from '@mui/icons-material/Map';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    chauffeurs: 0,
    vehicules: 0,
    factures: 0,
    trajets: 0,
  });

  useEffect(() => {
    axios.get('https://mme-backend.onrender.com/admin/dashboard')
      .then(res => {
        const { chauffeurs, vehicules, factures, trajets } = res.data;
        setStats({ chauffeurs, vehicules, factures, trajets });
      })
      .catch(err => {
        console.error('Erreur chargement dashboard:', err);
      });
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
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Tableau de bord
        </Typography>

        <Box
  display="flex"
  flexWrap="wrap"
  justifyContent="space-between"
  gap={2}
>
  {statItems.map((item, index) => (
    <Box
      key={index}
      sx={{
        flex: '1 1 calc(25% - 16px)', // 4 cartes par ligne avec espacement
        minWidth: 200,
      }}
    >
      <Card
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderLeft: `6px solid ${item.color}`,
          boxShadow: 3,
          height: 110,
        }}
      >
        <Avatar sx={{ bgcolor: item.color, width: 50, height: 50, mr: 2 }}>
          {item.icon}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {item.value}
          </Typography>
        </Box>
      </Card>
    </Box>
  ))}
</Box>


      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
