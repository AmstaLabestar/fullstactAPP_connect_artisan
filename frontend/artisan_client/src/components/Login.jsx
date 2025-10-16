import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = "http://localhost:8000/api/artisans/login/";

const Login = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        phone: data.phone,
        password: data.password,
      });

      // ✅ Vérifie si le token existe bien
      if (res.data && res.data.access) {
        setToken(res.data.access);
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      } else {
        toast.error("Token manquant dans la réponse !");
      }
    } catch (err) {
      // 🛡️ Gestion d'erreurs plus précise
      if (err.response?.status === 401) {
        toast.error("Numéro ou mot de passe invalide !");
      } else {
        toast.error("Erreur de connexion. Réessayez plus tard.");
        console.error("Erreur:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Toaster />
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Connexion Artisan
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("phone", { required: true })}
            placeholder="Téléphone"
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
            {...register("password", { required: true })}
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150"
          >
            Pas encore de compte ? Inscrivez-vous.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
