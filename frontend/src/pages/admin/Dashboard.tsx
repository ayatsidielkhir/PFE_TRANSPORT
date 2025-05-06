import React, { useState } from 'react';
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
  const [stats] = useState({
    chauffeurs: 12,
    vehicules: 8,
    factures: 5,
    trajets: 30,
  });

  const [factures] = useState([
    { client: 'Client A', montant: 4200 },
    { client: 'Client B', montant: 1550 },
  ]);

  const alerts = [
    { text: 'Visa de chauffeur expire dans 20 jours', color: '#FFB400' },
    { text: 'Contrat de chauff. expire dans 5 jours', color: '#FF5C00' },
    { text: 'Assurance véhicule expire demain', color: '#FF1E1E' },
  ];

  const recentActivity = [
    'Nouveau trajet ajouté',
    'Chauffeur ajouté',
    'Contrat de chauff. mis à jour',
  ];

  const barData = [
    { day: 'lun', value: 4 },
    { day: 'mar', value: 5 },
    { day: 'mer', value: 5 },
    { day: 'jeu', value: 7 },
    { day: 'ven', value: 5 },
    { day: 'dim', value: 8 },
  ];

  return (
    <AdminLayout>
      <Box sx={{ backgroundColor: '#fdf9f6', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={3}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Cartes statistiques */}
          {[
            { label: 'Nombre de chauffeurs', value: stats.chauffeurs },
            { label: 'Nombre de véhicules', value: stats.vehicules },
            { label: 'Factures à traiter aujourd\'hui', value: stats.factures },
            { label: 'Trajets du jour', value: stats.trajets },
          ].map((item, index) => (
            <Grid key={index} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
              <Card sx={{ borderRadius: 3, p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Graphique */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Circulation des véhicules
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Bar dataKey="value" fill="#A8C5FF" radius={5} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Alertes */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Alertes & notifications
                </Typography>
                {alerts.map((a, i) => (
                  <Box key={i} display="flex" alignItems="center" mb={1}>
                    <Box width={10} height={10} borderRadius="50%" bgcolor={a.color} mr={1.5} />
                    <Typography variant="body2" color="text.secondary">
                      {a.text}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Factures */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Factures à traiter aujourd'hui
                </Typography>
                {factures.map((f, i) => (
                  <Box key={i} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography fontWeight={600}>{f.client}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.montant.toFixed(2)} €
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 600 }}>
                      Voir
                    </Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Activité récente */}
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Activité récente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {recentActivity.map((act, i) => (
                  <Typography key={i} variant="body2" color="text.secondary" mb={1}>
                    {act}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default DashboardPage;
