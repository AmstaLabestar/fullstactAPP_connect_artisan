// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import { authAPI } from '../api/api';
import { setTokens, setArtisanProfile } from '../utils/auth';

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [metiers, setMetiers] = useState([]); // ✅ Initialisation correcte en tableau vide

  // Charger les métiers pour le select Many-to-Many
  useEffect(() => {
    const fetchMetiers = async () => {
      try {
        const response = await authAPI.getMetiers();
        
        // 🚨 CORRECTION : Extrait le tableau 'results' si la réponse est paginée, sinon utilise 'data'
        const metiersData = response.data.results || response.data;

        if (Array.isArray(metiersData)) {
            setMetiers(metiersData);
        } else {
            // Log de l'erreur si le format est inattendu
            console.error("L'API /metiers/ n'a pas retourné un tableau de résultats. Réponse:", response.data);
            setMetiers([]); 
        }

      } catch (error) {
        toast.error("Erreur lors du chargement des métiers.");
        console.error("Erreur lors du chargement des métiers:", error);
      }
    };
    fetchMetiers();
  }, []); // Exécuté une seule fois au montage

  const onSubmit = async (data) => {
    // Création de l'objet FormData pour gérer le champ fichier (photo_profil) et les autres données
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('ville', data.ville);
    formData.append('secteur', data.secteur || ''); 
    formData.append('password', data.password);
    
    // Les IDs des métiers sont ajoutés au FormData
    data.metiers.forEach(metierId => {
      formData.append('metiers', metierId); 
    });

    if (data.photo_profil && data.photo_profil.length > 0) {
      formData.append('photo_profil', data.photo_profil[0]);
    }

    try {
      const response = await authAPI.register(formData);
      
      const { access, refresh, artisan } = response.data;
      setTokens(access, refresh);
      setArtisanProfile(artisan);

      toast.success("Inscription réussie ! Bienvenue.");
      navigate('/dashboard/profile');

    } catch (error) {
      // Gérer les erreurs de validation du backend (ex: numéro déjà utilisé)
      const errorData = error.response?.data;
      let errorMessage = "Erreur d'inscription.";
      if (errorData) {
        // Afficher la première erreur de validation du backend
        errorMessage = Object.values(errorData).flat()[0] || errorMessage;
      }
      toast.error(errorMessage);
      console.error("Erreur d'inscription:", errorData);
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h2 className="card-title text-center mb-4">
          <UserPlus className="me-2" /> Inscription Artisan
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          
          <div className="row">
            {/* Colonne 1 (inchangée) */}
            <div className="col-md-6">
              
              <div className="mb-3">
                <label className="form-label" htmlFor="username">Nom d'utilisateur</label>
                <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`} {...register("username", { required: "Nom d'utilisateur requis" })} />
                {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register("email", { required: "Email requis" })} />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="phone">Numéro de Téléphone</label>
                <input type="text" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} {...register("phone", { required: "Numéro requis" })} />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="password">Mot de Passe</label>
                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register("password", { required: "Mot de passe requis" })} />
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
              </div>
            </div>

            {/* Colonne 2 */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" htmlFor="ville">Ville</label>
                <input type="text" className={`form-control ${errors.ville ? 'is-invalid' : ''}`} {...register("ville", { required: "Ville requise" })} />
                {errors.ville && <div className="invalid-feedback">{errors.ville.message}</div>}
              </div>
              
              <div className="mb-3">
                <label className="form-label" htmlFor="secteur">Secteur (Optionnel)</label>
                <input type="text" className="form-control" {...register("secteur")} />
              </div>
              
              <div className="mb-3">
                <label className="form-label" htmlFor="metiers">Métiers (Ctrl+Clic pour multiple)</label>
                <select 
                  multiple 
                  className={`form-select ${errors.metiers ? 'is-invalid' : ''}`} 
                  {...register("metiers", { required: "Vous devez choisir au moins un métier" })}
                >
                  {/* 🔒 VÉRIFICATION DE SÉCURITÉ : Assure que c'est un tableau */}
                  {Array.isArray(metiers) && metiers.map(metier => ( 
                    <option key={metier.id} value={metier.id}>
                      {metier.nom}
                    </option>
                  ))}
                </select>
                {errors.metiers && <div className="invalid-feedback">{errors.metiers.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="photo_profil">Photo de Profil (Optionnel)</label>
                <input type="file" className={`form-control ${errors.photo_profil ? 'is-invalid' : ''}`} {...register("photo_profil")} />
                {errors.photo_profil && <div className="invalid-feedback">{errors.photo_profil.message}</div>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-success w-100 mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-3 text-center">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Register;