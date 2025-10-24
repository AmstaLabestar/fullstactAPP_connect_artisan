// src/api/api.js

import axios from 'axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  logout
} from '../utils/auth';

const BASE_URL = 'http://localhost:8000/api/artisans'; // A adapter

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------
// Intercepteurs (Inchagés - Non inclus ici pour la concision)
// --------------------
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ... (Logique de rafraîchissement du token 401 inchangée)
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            'http://localhost:8000/api/token/refresh/',
            { refresh: refreshToken }
          );

          const { access, refresh } = refreshResponse.data;
          setTokens(access, refresh); 
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest); 
        } catch (refreshError) {
          logout();
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


// --------------------
// Fonctions API Nommées
// --------------------

export const authAPI = {
  login: (data) => api.post('/login/', data),
  register: (data) => {
    // La route /register/ est supposée ne pas être sous BASE_URL par défaut ici
    return axios.post(`http://localhost:8000/api/artisans/register/`, data, { 
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  logout: (data) => api.post('/logout/', data),
  getProfile: () => api.get('/profil/'),
  updateProfile: (data) => {
    const config = {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${getAccessToken()}`
      }
    };
    return axios.patch(`http://localhost:8000/api/artisans/profil/`, data, config);
  },
  getMetiers: () => api.get('/metiers/'),
};

// src/api/api.js (Ajouter à l'objet realisationAPI)

export const realisationAPI = {
  getRealisation: (id) => api.get(`/realisations/${id}/`),
  createRealisation: (data) => {
    return api.post('/realisations/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  likeToggle: (realisationId) => api.post(`/realisations/${realisationId}/like/`),
  
  // 🚀 NOUVELLE FONCTION AJOUTÉE
  getRealisationsByArtisan: (artisanId) => api.get(`/realisations/`, { 
      params: { artisan: artisanId } // Filtre sur le paramètre 'artisan'
  }), 
  // Fonction de mise à jour (nécessaire pour le mode édition)
    updateRealisation: (id, data) => {
        return api.patch(`/realisations/${id}/`, data, { // Utilisez PATCH pour les mises à jour avec fichier
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    
    // Vous aurez aussi besoin de la suppression si vous implémentez RealisationList.jsx
    deleteRealisation: (id) => api.delete(`/realisations/${id}/`),
};


/**
 * API publiques (accessibles par les non-connectés)
 */
export const publicAPI = {
  getArtisans: (params = {}) => api.get('/artisans/', { params }),
  getMetiers: () => api.get('/metiers/'), // Réutilisation de la même route que dans authAPI
};

// --------------------
// Exportation Finale
// --------------------
// On exporte explicitement toutes les API pour que Home.jsx puisse utiliser { publicAPI }
export default api; 
// Si vous voulez exporter toutes les fonctions nommées en plus de l'export par défaut:
// export { authAPI, realisationAPI, publicAPI };