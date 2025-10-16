export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const authHeader = () => {
  const token = getToken();
  // Retourne l'en-tête d'autorisation pour les requêtes API
  return token ? { Authorization: `Bearer ${token}` } : {};
};
