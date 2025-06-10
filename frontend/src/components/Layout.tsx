import {
  AppBar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Button, useMediaQuery, Typography
} from '@mui/material';
import {
  Menu, Logout, DirectionsBus, Badge, AccountTree, Payment, BusinessCenter,
  Gavel, Public, Settings, Paid
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logoMme-.png';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const sidebarItems = {
  admin: [
    { label: 'Dashboard', icon: <AccountTree />, path: '/admin/dashboard' },
    { label: 'Chauffeurs', icon: <Badge />, path: '/admin/chauffeurs' },
    { label: 'Véhicules', icon: <DirectionsBus />, path: '/admin/vehicules' },
    { label: 'Trajets', icon: <Public />, path: '/admin/trajets' },
    { label: 'Partenaires', icon: <BusinessCenter />, path: '/admin/partenaires' },
    { label: 'Factures', icon: <Payment />, path: '/admin/factures' },
    { label: 'Dossier Juridique', icon: <Gavel />, path: '/admin/dossier-juridique' },
    { label: 'Plateformes', icon: <Settings />, path: '/admin/plateformes' },
    { label: 'Charges', icon: <Paid />, path: '/admin/charges' },
  ]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(() => localStorage.getItem('drawerOpen') === 'true');
  const [activePath, setActivePath] = useState(() => localStorage.getItem('activePath') || '');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const token = localStorage.getItem('token');
  let role = 'guest';
  try {
    role = JSON.parse(atob(token!.split('.')[1])).role;
  } catch {
    role = 'guest';
  }

  const toggleDrawer = () => {
    setOpen(prev => {
      localStorage.setItem('drawerOpen', String(!prev));
      return !prev;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawerContent = (
    <List>
      {(sidebarItems as any)[role]?.map((item: any) => (
        <ListItemButton
          key={item.label}
          onClick={() => {
            navigate(item.path);
            setActivePath(item.path);
            localStorage.setItem('activePath', item.path);
            if (isMobile) setOpen(false);
          }}
          sx={{
            mb: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: activePath === item.path ? '#c62828' : 'transparent',
            '&:hover': {
              backgroundColor: '#ef5350',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontWeight: 500, color: 'white' }}
          />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* ✅ NAVBAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          bgcolor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          borderBottom: '1px solid #e0e0e0',
          height: '90px',
          justifyContent: 'center'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          {/* Logo + Menu */}
          <Box display="flex" alignItems="center" gap={3}>
            <IconButton edge="start" onClick={toggleDrawer} sx={{ color: '#001e61' }}>
              <Menu sx={{ fontSize: 30 }} />
            </IconButton>

            <Box sx={{ height: '80px' }}>
              <img
                src={logo}
                alt="MME Express Logo"
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: '240px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))'
                }}
              />
            </Box>
          </Box>

          {/* Titre centré */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              fontWeight: 600,
              color: '#001e61',
              fontSize: '17px',
              display: { xs: 'none', md: 'block' }
            }}
          >
            MME – Système de Management du Transport
          </Typography>

          {/* Déconnexion */}
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              backgroundColor: '#d32f2f',
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '15px',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
            startIcon={<Logout />}
          >
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      {/* ✅ SIDEBAR */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            marginTop: '90px', // ✅ aligné sous AppBar
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#001e61',
            color: 'white',
            borderRight: 'none',
            pt: 2,
            px: 1
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ✅ CONTENU */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#fcfcfc',
          minHeight: '100vh',
          padding: 3,
          pt: '110px', // ✅ décalage sous AppBar
          ml: isMobile ? 0 : 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
