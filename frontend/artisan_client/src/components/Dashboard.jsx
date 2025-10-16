import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, authHeader, removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import RealisationManager from "./RealisationManager";

const API_URL = "http://localhost:8000/api/artisans/profile/";

const Dashboard = () => {
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(API_URL, { headers: authHeader() });
        setArtisan(res.data);
      } catch (err) {
        console.error("Erreur profil:", err);
        toast.error("Session expirée, veuillez vous reconnecter.");
        removeToken();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    toast.success("Déconnexion réussie !");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-gray-600 text-lg animate-pulse">
          Chargement du profil...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Toaster />
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-2xl space-y-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600">
          Tableau de Bord Artisan
        </h2>

        {artisan ? (
          <>
            {/* Section Profil */}
            <div className="border-b pb-4 mb-4 space-y-3">
              <p className="text-lg">
                <span className="font-semibold text-gray-700">Nom :</span> {artisan.username}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-gray-700">Ville :</span> {artisan.ville}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-gray-700">Métier :</span> {artisan.type_metier}
              </p>

              {artisan.photo_profil && (
                <div className="pt-4 text-center">
                  <span className="font-semibold text-gray-700 block mb-2">
                    Photo de Profil :
                  </span>
                  <img
                    src={`http://localhost:8000${artisan.photo_profil}`}
                    alt="Profil"
                    className="w-24 h-24 object-cover rounded-full mx-auto border-4 border-indigo-200"
                  />
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md mt-4"
              >
                Se déconnecter
              </button>
            </div>

            {/* Section Réalisations */}
            <RealisationManager artisanId={artisan.id} />
          </>
        ) : (
          <p className="text-center text-gray-500">Aucune information trouvée.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
