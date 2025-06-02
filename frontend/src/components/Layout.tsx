import {
  AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Button
} from '@mui/material';
import {
  Menu, Logout, DirectionsBus, Badge, AccountTree, Payment, BusinessCenter,
  Gavel, Public, Settings, Paid
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logoMme-.png';

const drawerWidth = 240;

const sidebarItems = {
  admin: [
    { label: 'Dashboard', icon: <AccountTree />, path: '/admin/dashboard' },
    { label: 'Chauffeurs', icon: <Badge />, path: '/admin/chauffeurs' },
    { label: 'Véhicules', icon: <DirectionsBus />, path: '/admin/vehicules' },
    { label: 'Factures', icon: <Payment />, path: '/admin/factures' },
    { label: 'Trajets', icon: <Public />, path: '/admin/trajets' },
    { label: 'Partenaires', icon: <BusinessCenter />, path: '/admin/partenaires' },
    { label: 'Dossier Juridique', icon: <Gavel />, path: '/admin/dossier-juridique' },
    { label: 'Plateformes', icon: <Settings />, path: '/admin/plateformes' },
    { label: 'Charges', icon: <Paid />, path: '/admin/charges' },
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
      {/* TOPBAR */}
      <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#001e61', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)}>
              <Menu />
            </IconButton>
          <Box display="flex" alignItems="center" gap={2} ml={2}>
          <Box
            sx={{
              backgroundColor: 'white',
              padding: '2px 6px',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '44px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            <img
              src={logo}
              alt="MEXPRESS Logo"
              style={{
                height: '40px',
                objectFit: 'contain'
              }}
            />
          </Box>

  <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'white' }}>
    MME - Système de gestion de Transport
  </Typography>
</Box>


          </Box>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
            startIcon={<Logout />}
          >
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Drawer
        open={open}
        variant="persistent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#f8f9fa',
            borderRight: '1px solid #ddd',
            position: 'fixed',
            zIndex: 1200,
            pt: 8,
            px: 1
          }
        }}
      >
        <List sx={{ mt: 2 }}>
          {(sidebarItems as any)[role]?.map((item: any, index: number) => (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1.8,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#e0f0ff',
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#001e61', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          )) || (
            <ListItemButton>
              <ListItemText primary="Aucun accès" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      {/* CONTENU */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#fcfcfc',
          minHeight: '100vh',
          padding: 3,
          pl: open ? '80px' : '24px',
          pt: '100px'
        }}
      >
        {children}
      </Box>
    </Box>
  )
};