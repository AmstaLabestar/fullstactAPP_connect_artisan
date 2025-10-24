// src/pages/Dashboard.jsx

import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Image, Settings, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';
import { logout, getRefreshToken } from '../utils/auth';
import { authAPI } from '../api/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // Déjà déconnecté localement
      logout();
      navigate('/login');
      return;
    }

    try {
      await authAPI.logout({ refresh: refreshToken });
      toast.success("Déconnexion réussie.");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la déconnexion sur le serveur.");
    } finally {
      logout(); // Assure la déconnexion locale
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <div className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '250px' }}>
        <h4 className="mb-4 text-center">
          <LayoutDashboard className="me-2" /> Tableau de Bord
        </h4>
        <nav className="nav flex-column flex-grow-1">
          
          <Link 
            to="profile" 
            className={`nav-link text-white ${isActive('profile') ? 'bg-secondary rounded' : ''}`}
          >
            <User className="me-2" size={18} /> Profil
          </Link>
          
          <Link 
            to="realisations" 
            className={`nav-link text-white ${isActive('realisations') ? 'bg-secondary rounded' : ''}`}
          >
            <Image className="me-2" size={18} /> Réalisations
          </Link>
          
          <Link 
            to="settings" 
            className={`nav-link text-white ${isActive('settings') ? 'bg-secondary rounded' : ''}`}
          >
            <Settings className="me-2" size={18} /> Paramètres
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger mt-auto text-start"
          >
            <LogOut className="me-2" size={18} /> Déconnexion
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 bg-light">
        <Outlet /> {/* Affiche le composant enfant (Profile, Realisation, Settings) */}
      </div>
    </div>
  );
};

export default Dashboard;