import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../components/Layout';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    chauffeurs: 0,
    vehicules: 0,
    factures: 0,
    trajets: 0,
  });

  const [factures, setFactures] = useState<{ client: string; montant: number }[]>([]);
  const [alerts, setAlerts] = useState<{ text: string; color: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  const barData = [
    { day: 'lun', value: 4 },
    { day: 'mar', value: 5 },
    { day: 'mer', value: 5 },
    { day: 'jeu', value: 7 },
    { day: 'ven', value: 5 },
    { day: 'dim', value: 8 },
  ];

  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/dashboard')
      .then(res => {
        const { chauffeurs, vehicules, factures, trajets, facturesDuJour, alertes, activites } = res.data;
        setStats({ chauffeurs, vehicules, factures, trajets });
        setFactures(facturesDuJour || []);
        setAlerts(alertes || []);
        setRecentActivity(activites || []);
      })
      .catch(err => {
        console.error('Erreur chargement dashboard:', err);
      });
  }, []);

  return (
    <AdminLayout>
      <Box sx={{ backgroundColor: '#fdf9f6', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Dashboard
        </Typography>

        {/* Ligne 1 : Statistiques */}
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          {[{ label: 'Nombre de chauffeurs', value: stats.chauffeurs },
            { label: 'Nombre de véhicules', value: stats.vehicules },
            { label: 'Factures à traiter aujourd\'hui', value: stats.factures },
            { label: 'Trajets du jour', value: stats.trajets }
          ].map((item, index) => (
            <Card key={index} sx={{ flex: 1, minWidth: 220, p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" mb={1}>{item.label}</Typography>
              <Typography variant="h4" fontWeight={700}>{item.value}</Typography>
            </Card>
          ))}
        </Box>

        {/* Ligne 2 : Graphique + Alertes */}
        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <Card sx={{ flex: 1, minWidth: 300, p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Circulation des véhicules</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Bar dataKey="value" fill="#A8C5FF" radius={5} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card sx={{ flex: 1, minWidth: 300, p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Alertes & notifications</Typography>
            {alerts.map((a, i) => (
              <Box key={i} display="flex" alignItems="center" mb={1}>
                <Box width={10} height={10} borderRadius="50%" bgcolor={a.color} mr={1.5} />
                <Typography variant="body2" color="text.secondary">{a.text}</Typography>
              </Box>
            ))}
          </Card>
        </Box>

        {/* Ligne 3 : Factures + Activité */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Card sx={{ flex: 1, minWidth: 300, p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>Factures à traiter aujourd'hui</Typography>
            {factures.map((f, i) => (
              <Box key={i} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography fontWeight={600}>{f.client}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.montant.toFixed(2)} €</Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 600 }}>Voir</Button>
              </Box>
            ))}
          </Card>

          <Card sx={{ flex: 1, minWidth: 300, p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Activité récente</Typography>
            <Divider sx={{ mb: 2 }} />
            {recentActivity.map((act, i) => (
              <Typography key={i} variant="body2" color="text.secondary" mb={1}>{act}</Typography>
            ))}
          </Card>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
