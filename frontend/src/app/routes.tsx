import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RealisationsList } from './pages/RealisationsList';
import { RealisationDetail } from './pages/RealisationDetail';
import { ArtisansList } from './pages/ArtisansList';
import { ArtisanDetail } from './pages/ArtisanDetail';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { MesRealisations } from './pages/MesRealisations';
import { RealisationForm } from './pages/RealisationForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotFound } from './components/NotFound';
import { AppShell } from './components/AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell><Home /></AppShell>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/realisations',
    element: <AppShell><RealisationsList /></AppShell>,
  },
  {
    path: '/realisations/:id',
    element: <AppShell><RealisationDetail /></AppShell>,
  },
  {
    path: '/artisans',
    element: <AppShell><ArtisansList /></AppShell>,
  },
  {
    path: '/artisans/:id',
    element: <AppShell><ArtisanDetail /></AppShell>,
  },
  {
    path: '/dashboard',
    element: (
      <AppShell>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </AppShell>
    ),
  },
  {
    path: '/profil',
    element: (
      <AppShell>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </AppShell>
    ),
  },
  {
    path: '/mes-realisations',
    element: (
      <AppShell>
        <ProtectedRoute>
          <MesRealisations />
        </ProtectedRoute>
      </AppShell>
    ),
  },
  {
    path: '/mes-realisations/nouvelle',
    element: (
      <AppShell>
        <ProtectedRoute>
          <RealisationForm />
        </ProtectedRoute>
      </AppShell>
    ),
  },
  {
    path: '/mes-realisations/:id/modifier',
    element: (
      <AppShell>
        <ProtectedRoute>
          <RealisationForm />
        </ProtectedRoute>
      </AppShell>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
