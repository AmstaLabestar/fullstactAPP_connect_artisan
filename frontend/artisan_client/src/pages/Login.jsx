// src/pages/Login.jsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';
import { authAPI } from '../api/api';
import { setTokens, setArtisanProfile } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await authAPI.login(data);
      
      const { access, refresh, artisan } = response.data;
      
      // 1. Stocke les tokens
      setTokens(access, refresh);
      
      // 2. Stocke le profil de l'artisan
      setArtisanProfile(artisan);

      toast.success("Connexion réussie ! Bienvenue.");
      navigate('/dashboard/profile');

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erreur de connexion.";
      toast.error(errorMessage);
      console.error("Erreur de login:", error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">
          <LogIn className="me-2" /> Connexion Artisan
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          
          <div className="mb-3">
            <label className="form-label" htmlFor="phone">Numéro de Téléphone</label>
            <input
              type="text"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              id="phone"
              placeholder="Ex: 0612345678"
              {...register("phone", { required: "Le numéro est requis" })}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">Mot de Passe</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id="password"
              {...register("password", { required: "Le mot de passe est requis" })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 mt-3" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-3 text-center">
          Pas encore de compte ? <a href="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Login;