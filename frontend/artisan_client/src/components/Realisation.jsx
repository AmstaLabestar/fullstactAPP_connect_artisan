// src/components/Realisation.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Image, Upload, PlusCircle } from 'lucide-react';
import { realisationAPI } from '../api/api';

const Realisation = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [showForm, setShowForm] = useState(false);

  // Note: Ce composant gère uniquement la création pour l'exemple.
  // Pour une application complète, il faudrait une List/Create View.

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('titre', data.titre);
    formData.append('description', data.description || '');
    formData.append('is_available', data.is_available);
    
    // Le champ 'image' est requis dans votre modèle
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    } else {
        toast.error("L'image de la réalisation est requise.");
        return;
    }

    try {
      await realisationAPI.createRealisation(formData);
      toast.success("Réalisation ajoutée avec succès !");
      reset(); // Réinitialise le formulaire
      setShowForm(false);
      // Optionnel: rafraîchir la liste des réalisations si elle était affichée
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = "Erreur lors de l'ajout de la réalisation.";
      if (errorData) {
        // Afficher la première erreur de validation du backend
        errorMessage = Object.values(errorData).flat()[0] || errorMessage;
      }
      toast.error(errorMessage);
      console.error("Erreur de création de réalisation:", errorData);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Mes Réalisations</h3>
        <button 
          className="btn btn-light" 
          onClick={() => setShowForm(!showForm)}
        >
          <PlusCircle className="me-2" size={18} /> {showForm ? 'Masquer' : 'Ajouter une Réalisation'}
        </button>
      </div>
      
      {showForm && (
        <div className="card-body border-bottom">
          <h4 className="mb-3 text-success"><Upload className="me-2" size={20} /> Nouvelle Réalisation</h4>
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="titre">Titre (Optionnel)</label>
                <input type="text" className="form-control" {...register("titre")} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="image">Image (Fichier)</label>
                <input 
                  type="file" 
                  className={`form-control ${errors.image ? 'is-invalid' : ''}`} 
                  {...register("image", { required: "Une image est requise" })}
                  accept="image/*"
                />
                {errors.image && <div className="invalid-feedback">{errors.image.message}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="description">Description (Optionnel)</label>
              <textarea rows="3" className="form-control" {...register("description")}></textarea>
            </div>

            <div className="form-check mb-3">
                <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="is_available" 
                    defaultChecked 
                    {...register("is_available")}
                />
                <label className="form-check-label" htmlFor="is_available">Disponible/Visible</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Publier'}
            </button>
          </form>
        </div>
      )}
      
      <div className="card-body">
        {/* Ici, vous afficherez la liste des réalisations */}
        <p className="text-muted">Liste des réalisations de l'artisan (à implémenter)</p>
      </div>
    </div>
  );
};

export default Realisation;