
import {
  AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Divider
} from '@mui/material';
import {
  Menu, Dashboard, People, LocalShipping, Description, Receipt, Map,
  Business, Logout
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const sidebarItems = {
  admin: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { label: 'Chauffeurs', icon: <People />, path: '/admin/chauffeurs' },
    { label: 'Véhicules', icon: <LocalShipping />, path: '/admin/vehicules' },
    { label: 'Factures', icon: <Receipt />, path: '/admin/factures' },
    { label: 'Trajets', icon: <Map />, path: '/admin/trajets' },
    { label: 'Partenaires', icon: <Business />, path: '/admin/partenaires' },
    { label: 'Dossier Juridique', icon: <Description />, path: '/admin/dossier-juridique' } // ✅ AJOUT ICI
  ],
  responsable: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/responsable/dashboard' },
    { label: 'Chauffeurs', icon: <People />, path: '/responsable/chauffeurs' },
    { label: 'Véhicules', icon: <LocalShipping />, path: '/responsable/vehicules' },
    { label: 'Factures', icon: <Receipt />, path: '/responsable/factures' },
    { label: 'Trajets', icon: <Map />, path: '/responsable/trajets' },
    { label: 'Partenaires', icon: <Business />, path: '/responsable/partenaires' }
  ]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  let role = 'guest';
  try {
    role = JSON.parse(atob(token!.split('.')[1])).role;
  } catch {
    role = 'guest';
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#0379a8' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)}>
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ ml: 2 }}>
            Transport Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f8f9fa',
            borderRight: '1px solid #ddd'
          }
        }}
      >
        <Toolbar />
        <List sx={{ mt: 2 }}>
          {(sidebarItems as any)[role]?.map((item: any) => (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: '#e3f2fd' }
              }}
            >
              <ListItemIcon sx={{ color: '#0379a8' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          )) || (
            <ListItemButton>
              <ListItemText primary="Aucun accès" />
            </ListItemButton>
          )}
        </List>

        <Divider sx={{ my: 2 }} />

        <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#d32f2f' }}><Logout /></ListItemIcon>
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItemButton>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
