  import {
    Dashboard,
    People,
    LocalShipping,
    Description,
    Receipt,
    Map,
    Business
  } from '@mui/icons-material';

  import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
  import { Link, useLocation } from 'react-router-dom';

  const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
      { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
      { label: 'Chauffeurs', icon: <People />, path: '/admin/chauffeurs' },
      { label: 'Véhicules', icon: <LocalShipping />, path: '/admin/vehicules' },
      { label: 'Documents', icon: <Description />, path: '/admin/documents' },
      { label: 'Factures', icon: <Receipt />, path: '/admin/factures' },
      { label: 'Trajets', icon: <Map />, path: '/admin/trajets' },
      { label: 'Partenaires', icon: <Business />, path: '/admin/partenaires' },
    ];

    return (
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.label}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    );
  };

  export default Sidebar;
