import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  Chip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link } from 'react-router-dom';
import axios from 'axios';
import socket from '../../utils/socket'; // ← ajuste le chemin si besoin

interface Notification {
  type: 'trajet' | 'caisse' | 'charge';
  message: string;
  date: string;
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const [trajets, caisse, charges] = await Promise.all([
          axios.get('http://localhost:5001/api/notifications/trajets'),
          axios.get('http://localhost:5001/api/notifications/caisse'),
          axios.get('http://localhost:5001/api/notifications/charges'),
        ]);

        const all = [...trajets.data, ...caisse.data, ...charges.data];
        const todayNotifs = all.filter(n => isToday(n.date));
        todayNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setNotifications(todayNotifs.slice(0, 10));
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
      }
    };

    fetchAllNotifications();

    socket.on('notification', (newNotification) => {
      if (isToday(newNotification.date)) {
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          return updated.slice(0, 10);
        });
      }
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'trajet':
        return { icon: <DirectionsCarIcon color="primary" />, color: 'primary', label: 'TRAJET' };
      case 'caisse':
        return { icon: <AttachMoneyIcon color="success" />, color: 'success', label: 'CAISSE' };
      case 'charge':
        return { icon: <ReceiptLongIcon color="error" />, color: 'error', label: 'CHARGE' };
      default:
        return { icon: null, color: 'default', label: 'AUTRE' };
    }
  };

  const grouped = {
    trajet: notifications.filter(n => n.type === 'trajet'),
    caisse: notifications.filter(n => n.type === 'caisse'),
    charge: notifications.filter(n => n.type === 'charge'),
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        🔔 Notifications du jour
      </Typography>

      {/* Trajets */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight={500}>Trajets récents</Typography>
          <Button component={Link} to="/admin/trajets" size="small">Tout voir</Button>
        </Box>
        {grouped.trajet.map((n, idx) => (
          <Box key={idx} display="flex" alignItems="center" mb={1}>
            {getIconAndColor(n.type).icon}
            <Box ml={1}>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
            <Box ml="auto">
              <Chip size="small" label={getIconAndColor(n.type).label} color={getIconAndColor(n.type).color as any} />
            </Box>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Caisse */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight={500}>Opérations de caisse</Typography>
          <Button component={Link} to="/admin/caisse" size="small">Tout voir</Button>
        </Box>
        {grouped.caisse.map((n, idx) => (
          <Box key={idx} display="flex" alignItems="center" mb={1}>
            {getIconAndColor(n.type).icon}
            <Box ml={1}>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
            <Box ml="auto">
              <Chip size="small" label={getIconAndColor(n.type).label} color={getIconAndColor(n.type).color as any} />
            </Box>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
      </Box>

      {/* Charges */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography fontWeight={500}>Charges ajoutées</Typography>
          <Button component={Link} to="/admin/charges" size="small">Tout voir</Button>
        </Box>
        {grouped.charge.map((n, idx) => (
          <Box key={idx} display="flex" alignItems="center" mb={1}>
            {getIconAndColor(n.type).icon}
            <Box ml={1}>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
            <Box ml="auto">
              <Chip size="small" label={getIconAndColor(n.type).label} color={getIconAndColor(n.type).color as any} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default NotificationsList;
