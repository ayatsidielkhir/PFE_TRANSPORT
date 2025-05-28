import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './router/ProtectedRoute';
import Layout from './components/Layout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminChauffeurs from './pages/admin/Chauffeurs';
import AdminVehicules from './pages/admin/Vehicules';
import AdminFactures from './pages/admin/Factures';
import AdminTrajets from './pages/admin/Trajets';
import AdminPartenaires from './pages/admin/Partenaires';
import AdminComptabilite from './pages/admin/Comptabilite';
import DossierJuridique from './pages/admin/DossierJuridique'; // ✅ import ajouté
import PlateformesPage from './pages/admin/plateform';
import ChargesPage from './pages/admin/ChargesPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/chauffeurs" element={<ProtectedRoute><AdminChauffeurs /></ProtectedRoute>} />
        <Route path="/admin/vehicules" element={<ProtectedRoute><AdminVehicules /></ProtectedRoute>} />
        <Route path="/admin/factures" element={<ProtectedRoute><AdminFactures /></ProtectedRoute>} />
        <Route path="/admin/trajets" element={<ProtectedRoute><Layout><AdminTrajets /></Layout></ProtectedRoute>} />
        <Route path="/admin/partenaires" element={<ProtectedRoute><AdminPartenaires /></ProtectedRoute>} />
        <Route path="/admin/comptabilite" element={<ProtectedRoute><AdminComptabilite /></ProtectedRoute>} />
        <Route path="/admin/dossier-juridique" element={<ProtectedRoute><DossierJuridique /></ProtectedRoute>} /> 
        <Route path="/admin/plateformes" element={<ProtectedRoute><PlateformesPage /></ProtectedRoute>} /> 
        <Route path="/admin/charges" element={<ProtectedRoute><ChargesPage /></ProtectedRoute>} />

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
