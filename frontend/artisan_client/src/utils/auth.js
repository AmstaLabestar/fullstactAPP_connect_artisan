// src/utils/auth.js

/**
 * Gestionnaire de l'état d'authentification et des tokens JWT.
 */

// Clés de stockage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_PROFILE_KEY = 'artisanProfile';

// --------------------
// Stockage / Récupération des Tokens
// --------------------

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// --------------------
// Stockage / Récupération du Profil Utilisateur
// --------------------

export const setArtisanProfile = (profileData) => {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileData));
};

export const getArtisanProfile = () => {
  const profile = localStorage.getItem(USER_PROFILE_KEY);
  return profile ? JSON.parse(profile) : null;
};

// --------------------
// État d'Authentification
// --------------------

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
  // Optionnel : recharger la page pour vider l'état global
  // window.location.href = '/login'; 
};