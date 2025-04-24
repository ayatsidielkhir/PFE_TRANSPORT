import React, { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './dashboard-layout.css';

interface Props {
  children: ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = JSON.parse(atob(token.split('.')[1]));
      setRole(decodedToken.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">🚚 ERP Transport</h2>
        <ul className="sidebar-links">
          {role === 'admin' && (
            <>
              <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/admin/chauffeurs">Chauffeurs</NavLink></li>
              <li><NavLink to="/admin/vehicules">Véhicules</NavLink></li>
              <li><NavLink to="/admin/documents">Documents</NavLink></li>
              <li><NavLink to="/admin/factures">Factures</NavLink></li>
              <li><NavLink to="/admin/trajets">Trajets</NavLink></li>
              <li><NavLink to="/admin/partenaires">Partenaires</NavLink></li>
              <li><NavLink to="/admin/comptabilite">Comptabilité</NavLink></li>
            </>
          )}

          {role === 'responsable' && (
            <>
              <li><NavLink to="/responsable/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/responsable/chauffeurs">Chauffeurs</NavLink></li>
              <li><NavLink to="/responsable/vehicules">Véhicules</NavLink></li>
              <li><NavLink to="/responsable/documents">Documents</NavLink></li>
              <li><NavLink to="/responsable/factures">Factures</NavLink></li>
              <li><NavLink to="/responsable/trajets">Trajets</NavLink></li>
              <li><NavLink to="/responsable/partenaires">Partenaires</NavLink></li>
            </>
          )}

          <li><button onClick={handleLogout} className="logout-btn">Déconnexion</button></li>
        </ul>
      </aside>
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
