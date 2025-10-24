// src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Briefcase, Mail, Image as ImageIcon } from 'lucide-react';
import { authAPI } from '../api/api';
import { getArtisanProfile, setArtisanProfile } from '../utils/auth';

const Profile = () => {
  const [profile, setProfile] = useState(getArtisanProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [metiersList, setMetiersList] = useState([]);
  
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: profile || {}
  });

  // 1. Chargement des données initiales (profil et liste des métiers)
  useEffect(() => {
    // Récupérer le profil à jour depuis l'API si nécessaire
    const fetchProfileAndMetiers = async () => {
      try {
        // Optionnel: Mettre à jour le profil local avec les données API
        const profileRes = await authAPI.getProfile();
        setProfile(profileRes.data);
        setArtisanProfile(profileRes.data);
        reset(profileRes.data);
        
        // Charger la liste complète des métiers pour la sélection
        const metiersRes = await authAPI.getMetiers();
        setMetiersList(metiersRes.data);
      } catch (error) {
        toast.error("Erreur lors du chargement du profil.");
        console.error("Erreur de chargement du profil:", error);
      }
    };
    fetchProfileAndMetiers();
  }, [reset]);

  // 2. Soumission du formulaire de mise à jour
  const onSubmit = async (data) => {
    const formData = new FormData();
    // Seuls les champs modifiables sont envoyés
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('ville', data.ville);
    formData.append('secteur', data.secteur || ''); 
    
    // Gérer les métiers: envoyer une liste d'IDs
    const selectedMetierIds = Array.isArray(data.metiers) ? data.metiers.map(id => parseInt(id)) : [];
    selectedMetierIds.forEach(id => formData.append('metiers', id));
    
    // Gérer le fichier photo
    if (data.photo_profil && data.photo_profil.length > 0) {
      formData.append('photo_profil', data.photo_profil[0]);
    }
    
    try {
      const response = await authAPI.updateProfile(formData);
      setProfile(response.data);
      setArtisanProfile(response.data);
      toast.success("Profil mis à jour avec succès.");
      setIsEditing(false); // Quitter le mode édition
      reset(response.data); // Synchroniser le formulaire avec les nouvelles données
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Erreur de mise à jour.";
      toast.error(errorMessage);
      console.error("Erreur de mise à jour du profil:", error);
    }
  };

  if (!profile) return <div className="text-center mt-5">Chargement du profil...</div>;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Mon Profil Artisan</h3>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-start mb-4">
          <div className="me-4">
            {profile.photo_profil ? (
              <img 
                src={profile.photo_profil} 
                alt="Photo de profil" 
                className="rounded-circle border border-5"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ width: '150px', height: '150px', fontSize: '3rem' }}
              >
                <User size={80} />
              </div>
            )}
          </div>
          <div>
            <h4 className="card-title">{profile.username}</h4>
            <p className="text-muted mb-0">{profile.email}</p>
          </div>
        </div>

        <button 
          className="btn btn-warning mb-4" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Annuler l\'édition' : 'Modifier le Profil'}
        </button>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            {/* Colonne 1 : Champs de base */}
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Informations de base</h5>
              
              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><User size={18} className="me-2" /> Nom d'utilisateur</label>
                <input 
                  type="text" 
                  className="form-control" 
                  defaultValue={profile.username}
                  {...register("username", { required: "Nom d'utilisateur requis" })} 
                  readOnly={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><Phone size={18} className="me-2" /> Numéro de Téléphone</label>
                <input 
                  type="text" 
                  className="form-control" 
                  defaultValue={profile.phone} 
                  readOnly // Non modifiable par l'API
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><Mail size={18} className="me-2" /> Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  defaultValue={profile.email} 
                  {...register("email")}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Colonne 2 : Géolocalisation et Métiers */}
            <div className="col-md-6">
              <h5 className="mb-3 text-primary">Localisation et Expertise</h5>
              
              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><MapPin size={18} className="me-2" /> Ville</label>
                <input 
                  type="text" 
                  className="form-control" 
                  defaultValue={profile.ville} 
                  {...register("ville", { required: "Ville requise" })}
                  readOnly={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><MapPin size={18} className="me-2" /> Secteur</label>
                <input 
                  type="text" 
                  className="form-control" 
                  defaultValue={profile.secteur || ''} 
                  {...register("secteur")}
                  readOnly={!isEditing}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label d-flex align-items-center"><Briefcase size={18} className="me-2" /> Métiers</label>
                {isEditing ? (
                  <select 
                    multiple 
                    className="form-select" 
                    defaultValue={profile.metiers.map(m => m.id)} // Sélectionne les métiers actuels
                    {...register("metiers")}
                  >
                    {metiersList.map(metier => (
                      <option key={metier.id} value={metier.id}>
                        {metier.nom}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="form-control-plaintext border p-2 rounded bg-light">
                    {profile.metiers.length > 0 ? profile.metiers.map(m => m.nom).join(', ') : 'Aucun métier défini'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Photo de profil (uniquement en édition) */}
            {isEditing && (
              <div className="col-12 mt-3">
                <div className="mb-3">
                  <label className="form-label d-flex align-items-center"><ImageIcon size={18} className="me-2" /> Nouvelle Photo de Profil (Max 2MB)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    {...register("photo_profil")}
                    accept="image/*"
                  />
                </div>
              </div>
            )}
          </div>
          
          {isEditing && (
            <button 
              type="submit" 
              className="btn btn-success mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;