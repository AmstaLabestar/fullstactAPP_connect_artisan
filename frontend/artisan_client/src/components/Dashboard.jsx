import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, authHeader, removeToken } from "../utils/auth";

const Dashboard = () => {
  const [artisan, setArtisan] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/artisans/profile/",
          { headers: authHeader() }
        );
        setArtisan(res.data);
      } catch (err) {
        console.log(err.response?.data);
        removeToken();
        window.location.href = "/login";
      }
    };

    if (!getToken()) {
      window.location.href = "/login";
    } else {
      fetchProfile();
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <div className="container">
      <h2>Dashboard Artisan</h2>
      {artisan ? (
        <div>
          <p>Nom: {artisan.username}</p>
          <p>Ville: {artisan.ville}</p>
          <p>Métier: {artisan.type_metier}</p>
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      ) : (
        <p>Chargement...</p>
      )}
    </div>
  );
};

export default Dashboard;
