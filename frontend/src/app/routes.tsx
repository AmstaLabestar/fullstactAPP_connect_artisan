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
import { Layout } from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
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
    element: <Layout><RealisationsList /></Layout>,
  },
  {
    path: '/realisations/:id',
    element: <Layout><RealisationDetail /></Layout>,
  },
  {
    path: '/artisans',
    element: <Layout><ArtisansList /></Layout>,
  },
  {
    path: '/artisans/:id',
    element: <Layout><ArtisanDetail /></Layout>,
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/profil',
    element: (
      <Layout>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/mes-realisations',
    element: (
      <Layout>
        <ProtectedRoute>
          <MesRealisations />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/mes-realisations/nouvelle',
    element: (
      <Layout>
        <ProtectedRoute>
          <RealisationForm />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/mes-realisations/:id/modifier',
    element: (
      <Layout>
        <ProtectedRoute>
          <RealisationForm />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);