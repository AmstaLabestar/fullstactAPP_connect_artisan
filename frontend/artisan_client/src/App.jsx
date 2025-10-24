// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ArtisanRealisations from './pages/ArtisanRealisations';
import RealisationList from './pages/RealisationList';
import AddEditRealisation from './pages/AddEditRealisation';

// Composants du Dashboard
import Profile from './components/Profile';
// import Settings from './components/Settings'; // A créer

import { isAuthenticated } from './utils/auth';

// Composant de protection de route
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artisan/:profileId/realisations" element={<ArtisanRealisations />} />
        
        {/* Route Dashboard Protégée */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Routes Enfants du Dashboard (affichées dans <Outlet/>) */}
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="realisations" element={<RealisationList />} /> 
            <Route path="realisation/add" element={<AddEditRealisation />} /> 
            <Route path="realisation/edit/:id" element={<AddEditRealisation />} />
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>

        {/* Redirection par défaut vers le Dashboard ou la page de Login */}
        <Route path="*" element={<Navigate to="/dashboard/profile" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;